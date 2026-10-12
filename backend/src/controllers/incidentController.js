// -----------------------------------------------------------------------------
// incidentController.js — this is where most of ResQNet's "smart" behaviour
// lives: creating a report triggers AI analysis + duplicate detection, and
// every mutation broadcasts a Socket.IO event so every open dashboard updates
// live without polling.
// -----------------------------------------------------------------------------

const asyncHandler = require('express-async-handler');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { analyzeIncident } = require('../services/aiService');
const { findDuplicate } = require('../services/duplicateService');
const { computeTrustScore, shouldEscalate } = require('../services/trustScoreService');
const { getIO } = require('../services/socketService');

// @route POST /api/incidents
// @access citizen (or anyone reporting an SOS)
const createIncident = asyncHandler(async (req, res) => {
  const { type, title, description, category, lng, lat, address, imageUrl, reporterLng, reporterLat } = req.body;

  const longitude = Number(lng);
  const latitude = Number(lat);
  if (
    typeof title !== 'string' || !title.trim() || title.length > 160 ||
    typeof description !== 'string' || !description.trim() || description.length > 5000 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90
  ) {
    res.status(400);
    throw new Error('Provide a title, description, and valid longitude/latitude');
  }

  const hasReporterLng = reporterLng !== undefined && reporterLng !== null && reporterLng !== '';
  const hasReporterLat = reporterLat !== undefined && reporterLat !== null && reporterLat !== '';
  if (hasReporterLng !== hasReporterLat) {
    res.status(400);
    throw new Error('Reporter longitude and latitude must be provided together');
  }
  const parsedReporterLng = Number(reporterLng);
  const parsedReporterLat = Number(reporterLat);
  if (hasReporterLng && (!Number.isFinite(parsedReporterLng) || parsedReporterLng < -180 || parsedReporterLng > 180 || !Number.isFinite(parsedReporterLat) || parsedReporterLat < -90 || parsedReporterLat > 90)) {
    res.status(400);
    throw new Error('Reporter location must contain valid longitude and latitude');
  }
  if (imageUrl && (typeof imageUrl !== 'string' || imageUrl.length > 3_000_000)) {
    res.status(400);
    throw new Error('Incident image must be a URL or image data under 3 MB');
  }

  const incident = await Incident.create({
    type: type || 'incident_report',
    title,
    description,
    category: category || 'other',
    location: { coordinates: [longitude, latitude], address },
    // Only set reporterLocation if the frontend actually captured GPS
    // permission — undefined/omitted lng/lat means "no signal", handled as
    // a neutral score rather than a penalty in trustScoreService.
    reporterLocation:
      hasReporterLng
        ? { coordinates: [parsedReporterLng, parsedReporterLat] }
        : undefined,
    reportedBy: req.user?._id,
    imageUrl,
    timeline: [{ status: 'reported', note: 'Report submitted by citizen', actor: req.user?._id }],
  });

  const [aiResult, duplicateId] = await Promise.all([
    analyzeIncident({ title, description }),
    findDuplicate(incident),
  ]);

  incident.aiAnalysis = {
    summary: aiResult.summary,
    suggestedSeverity: aiResult.suggestedSeverity,
    suggestedCategory: aiResult.suggestedCategory,
    suggestedResources: aiResult.suggestedResources || [],
    recommendedResources: aiResult.recommendedResources,
    etaMinutes: aiResult.etaMinutes,
    confidence: aiResult.confidence,
    generatedAt: new Date(),
    source: aiResult.source,
  };
  // Only auto-apply the AI's severity suggestion if the citizen didn't
  // already flag it as critical themselves (never downgrade urgency).
  if (incident.severity !== 'critical') {
    incident.severity = aiResult.suggestedSeverity || incident.severity;
  }

  if (duplicateId) {
    incident.duplicateOf = duplicateId;
    incident.status = 'merged';
  }

  // Compute the initial trust score from whatever signals we have so far
  // (GPS + AI confidence — crowd/authority start neutral until people weigh in).
  incident.verification = computeTrustScore({
    incidentCoords: incident.location.coordinates,
    reporterCoords: incident.reporterLocation?.coordinates || null,
    votes: incident.crowdVotes,
    authorityVerification: incident.authorityVerification,
    aiAnalysis: incident.aiAnalysis,
  });
  incident.escalated = shouldEscalate({
    severity: incident.severity,
    status: incident.status,
    trustState: incident.verification.trustState,
  });

  await incident.save();

  // Broadcast to every connected EOC dashboard in real time.
  getIO().emit('incident:new', incident);
  if (incident.escalated) {
    getIO().emit('incident:escalated', incident);
  }

  res.status(201).json({ success: true, incident });
});

// @route GET /api/incidents
// Supports simple filtering used by the dashboards, e.g.
//   /api/incidents?status=reported&severity=critical
const getIncidents = asyncHandler(async (req, res) => {
  const { status, severity, category, mine } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (severity) filter.severity = severity;
  if (category) filter.category = category;
  if (mine === 'true' && req.user) filter.reportedBy = req.user._id;

  const incidents = await Incident.find(filter)
    .sort({ createdAt: -1 })
    .populate('reportedBy', 'name role')
    .populate('assignedTeam', 'name organizationName');

  res.json({ success: true, count: incidents.length, incidents });
});

// @route GET /api/incidents/:id
const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate('reportedBy', 'name role')
    .populate('assignedTeam', 'name organizationName');

  if (!incident) {
    res.status(404);
    throw new Error('Incident not found');
  }
  res.json({ success: true, incident });
});

// @route PATCH /api/incidents/:id/status
// @access eoc, admin, rescue_team
const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { status, note, assignedTeam } = req.body;
  if (status !== undefined && !['reported', 'acknowledged', 'dispatched', 'in_progress', 'resolved', 'merged', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid incident status');
  }
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    res.status(404);
    throw new Error('Incident not found');
  }

  const isRescueTeam = req.user.role === 'rescue_team';
  if (isRescueTeam) {
    if (req.user.verificationDocument?.status !== 'approved') {
      res.status(403);
      throw new Error('Your rescue organization must be verified before managing incidents');
    }
    const isAssignedToRequester = incident.assignedTeam?.toString() === req.user._id.toString();
    const isSelfAssign = !incident.assignedTeam && assignedTeam?.toString() === req.user._id.toString() && status === 'dispatched';
    if (!isAssignedToRequester && !isSelfAssign) {
      res.status(403);
      throw new Error('You can only update incidents assigned to your rescue team or self-assign an unassigned incident');
    }
    if (assignedTeam && !isSelfAssign) {
      res.status(403);
      throw new Error('Rescue teams cannot reassign incidents');
    }
    if (status && !['dispatched', 'in_progress', 'resolved'].includes(status)) {
      res.status(403);
      throw new Error('Rescue teams can only mark assigned incidents dispatched, in progress, or resolved');
    }
  } else if (assignedTeam) {
    const assignee = await User.findOne({ _id: assignedTeam, role: 'rescue_team', 'verificationDocument.status': 'approved' });
    if (!assignee) {
      res.status(400);
      throw new Error('Incidents can only be assigned to a verified rescue team account');
    }
  }

  if (typeof note === 'string' && note.length > 500) {
    res.status(400);
    throw new Error('Timeline notes must be 500 characters or fewer');
  }

  if (status) incident.status = status;
  if (assignedTeam) incident.assignedTeam = assignedTeam;
  incident.timeline.push({ status: status || incident.status, note: typeof note === 'string' ? note : '', actor: req.user._id });

  await incident.save();
  await incident.populate('reportedBy', 'name role');
  await incident.populate('assignedTeam', 'name organizationName');

  getIO().emit('incident:update', incident);

  res.json({ success: true, incident });
});

// @route POST /api/incidents/:id/crowd-verify
// @access any authenticated user except the original reporter (one vote per
// person, changing your mind overwrites your previous vote rather than
// stacking, so the same person can't tip the score by voting repeatedly).
const crowdVerify = asyncHandler(async (req, res) => {
  const { vote } = req.body; // 'confirm' | 'dispute'
  if (!['confirm', 'dispute'].includes(vote)) {
    res.status(400);
    throw new Error("vote must be 'confirm' or 'dispute'");
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    res.status(404);
    throw new Error('Incident not found');
  }

  if (incident.reportedBy && incident.reportedBy.toString() === req.user._id.toString()) {
    res.status(403);
    throw new Error('You cannot verify your own report');
  }

  const existingVoteIndex = incident.crowdVotes.findIndex(
    (v) => v.user.toString() === req.user._id.toString()
  );
  if (existingVoteIndex >= 0) {
    incident.crowdVotes[existingVoteIndex].vote = vote;
    incident.crowdVotes[existingVoteIndex].at = new Date();
  } else {
    incident.crowdVotes.push({ user: req.user._id, vote });
  }

  incident.verification = computeTrustScore({
    incidentCoords: incident.location.coordinates,
    reporterCoords: incident.reporterLocation?.coordinates || null,
    votes: incident.crowdVotes,
    authorityVerification: incident.authorityVerification,
    aiAnalysis: incident.aiAnalysis,
  });
  incident.escalated = shouldEscalate({
    severity: incident.severity,
    status: incident.status,
    trustState: incident.verification.trustState,
  });

  await incident.save();
  await incident.populate('reportedBy', 'name role');
  await incident.populate('assignedTeam', 'name organizationName');
  getIO().emit('incident:update', incident);
  res.json({ success: true, incident });
});

// @route PATCH /api/incidents/:id/authority-verify
// @access eoc, admin, rescue_team — stands in for the police/fire/municipal
// verification step from the spec until dedicated authority accounts exist;
// the architecture (authorize() + role enum) already supports adding them.
const authorityVerify = asyncHandler(async (req, res) => {
  const { status, note } = req.body; // 'confirmed' | 'rejected'
  if (!['confirmed', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'confirmed' or 'rejected'");
  }

  const incident = await Incident.findById(req.params.id);
  if (!incident) {
    res.status(404);
    throw new Error('Incident not found');
  }

  if (req.user.role === 'rescue_team' && incident.assignedTeam?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Rescue teams can verify only incidents assigned to them');
  }
  if (req.user.role === 'rescue_team' && req.user.verificationDocument?.status !== 'approved') {
    res.status(403);
    throw new Error('Your rescue organization must be verified before reviewing incidents');
  }

  incident.authorityVerification = { status, verifiedBy: req.user._id, note, at: new Date() };
  incident.timeline.push({
    status: incident.status,
    note: `Authority ${status} this report${note ? `: ${note}` : ''}`,
    actor: req.user._id,
  });

  incident.verification = computeTrustScore({
    incidentCoords: incident.location.coordinates,
    reporterCoords: incident.reporterLocation?.coordinates || null,
    votes: incident.crowdVotes,
    authorityVerification: incident.authorityVerification,
    aiAnalysis: incident.aiAnalysis,
  });
  if (status === 'rejected') {
    incident.status = 'rejected';
  }
  incident.escalated = shouldEscalate({
    severity: incident.severity,
    status: incident.status,
    trustState: incident.verification.trustState,
  });

  await incident.save();
  await incident.populate('reportedBy', 'name role');
  await incident.populate('assignedTeam', 'name organizationName');
  getIO().emit('incident:update', incident);
  res.json({ success: true, incident });
});

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
  crowdVerify,
  authorityVerify,
};
