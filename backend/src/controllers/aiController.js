// -----------------------------------------------------------------------------
// aiController.js — powers the EOC dashboard's "situation summary" panel:
// given the current list of open incidents, produce a short human-readable
// briefing. Reuses the same Gemini/mock strategy as aiService, just with a
// different prompt shape, to show the pattern generalizes.
// -----------------------------------------------------------------------------

const asyncHandler = require('express-async-handler');
const Incident = require('../models/Incident');
const Facility = require('../models/Facility');
const { analyzeIncident } = require('../services/aiService');
const { generateCitizenAdvice, parseEOCQuery } = require('../services/chatService');
const { distanceMeters } = require('../utils/geo');

// @route GET /api/ai/situation-summary
// @access eoc, admin
const getSituationSummary = asyncHandler(async (req, res) => {
  const openIncidents = await Incident.find({ status: { $nin: ['resolved', 'merged'] } });

  const counts = openIncidents.reduce((acc, inc) => {
    acc[inc.severity] = (acc[inc.severity] || 0) + 1;
    return acc;
  }, {});

  // For the portfolio project we keep this deterministic/offline — it's a
  // simple aggregation rather than another AI call, which keeps the EOC
  // dashboard fast and free-tier-quota-friendly. Swapping this for a real
  // Gemini call is a one-line change (see aiService.analyzeIncident).
  const summary =
    openIncidents.length === 0
      ? 'No active incidents. All clear.'
      : `${openIncidents.length} active incident(s): ` +
        Object.entries(counts)
          .map(([severity, count]) => `${count} ${severity}`)
          .join(', ') +
        '. Prioritize critical and high severity reports first.';

  res.json({
    success: true,
    summary,
    counts,
    totalOpen: openIncidents.length,
  });
});

// @route POST /api/ai/classify
// Lets the frontend preview an AI classification before submitting a report
// (used on the "Report Incident" form for instant feedback).
const classifyDraft = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 160 || typeof description !== 'string' || description.trim().length < 10 || description.length > 5000) {
    res.status(400);
    throw new Error('Provide a title (3–160 characters) and description (10–5000 characters)');
  }
  const result = await analyzeIncident({ title, description });
  res.json({ success: true, ...result });
});

// @route POST /api/ai/chat
// @access any authenticated user — behavior branches by role:
//   citizen/volunteer/ngo -> safety advice + nearest shelter distance
//   eoc/admin/rescue_team -> natural-language incident search
// This is the bottom-right assistant widget's single endpoint.
const chat = asyncHandler(async (req, res) => {
  const { message, lng, lat } = req.body;
  if (typeof message !== 'string' || !message.trim() || message.length > 1000) {
    res.status(400);
    throw new Error('Message is required and must be 1000 characters or fewer');
  }

  const hasLng = lng !== undefined && lng !== null;
  const hasLat = lat !== undefined && lat !== null;
  if (hasLng !== hasLat || (hasLng && (!Number.isFinite(Number(lng)) || Number(lng) < -180 || Number(lng) > 180 || !Number.isFinite(Number(lat)) || Number(lat) < -90 || Number(lat) > 90))) {
    res.status(400);
    throw new Error('Provide a valid longitude and latitude together');
  }

  const isDispatcher = ['eoc', 'admin', 'rescue_team'].includes(req.user.role);

  if (isDispatcher) {
    const { filter, description } = parseEOCQuery(message);
    const incidents = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title severity status category verification createdAt');

    const reply =
      incidents.length === 0
        ? `No incidents match "${description}".`
        : `Found ${incidents.length} report(s) matching "${description}".`;

    return res.json({ success: true, reply, incidents, mode: 'eoc_search' });
  }

  // Citizen-facing: safety advice + nearest shelter, if we have a location.
  let reply = generateCitizenAdvice(message);
  let nearestShelter = null;

  if (hasLng) {
    const shelter = await Facility.findOne({
      type: 'shelter',
      status: { $ne: 'closed' },
      location: {
        $near: { $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] } },
      },
    });

    if (shelter) {
      const distanceKm = (distanceMeters([Number(lng), Number(lat)], shelter.location.coordinates) / 1000).toFixed(1);
      nearestShelter = { name: shelter.name, distanceKm: Number(distanceKm), address: shelter.location.address };
      reply += ` Nearest shelter: ${shelter.name} (${distanceKm} km away).`;
    }
  }

  res.json({ success: true, reply, nearestShelter, mode: 'citizen_advice' });
});

module.exports = { getSituationSummary, classifyDraft, chat };
