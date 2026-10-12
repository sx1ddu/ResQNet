// Deterministic seed fixture data for the Mumbai monsoon-response scenario.
// IDs are fixed so foreign keys stay stable across repeat runs.
const IDS = {
  users: {
    citizen: '650000000000000000000001',
    eoc: '650000000000000000000002',
    rescue: '650000000000000000000003',
    hospital: '650000000000000000000004',
    shelter: '650000000000000000000005',
    volunteer: '650000000000000000000006',
  },
  facilities: {
    sionShelter: '650000000000000000000101',
    dadarShelter: '650000000000000000000102',
    kurlaShelter: '650000000000000000000103',
    sionHospital: '650000000000000000000111',
    kemHospital: '650000000000000000000112',
    bkcHospital: '650000000000000000000113',
  },
  incidents: {
    hindmataSos: '650000000000000000000201',
    sionRoad: '650000000000000000000202',
    bkcSupplies: '650000000000000000000203',
    kurlaMedical: '650000000000000000000204',
    dadarElectrical: '650000000000000000000205',
    parelBuilding: '650000000000000000000206',
    bycullaFire: '650000000000000000000207',
    duplicateHindmata: '650000000000000000000208',
    chemburMissing: '650000000000000000000209',
    thaneTremor: '650000000000000000000210',
  },
  alerts: {
    flood: '650000000000000000000301',
    evacuation: '650000000000000000000302',
    hospital: '650000000000000000000303',
  },
};

const DEMO_PASSWORD = 'Demo@1234'; // Intentionally shared demo-only credential.
const DEMO_EMAILS = [
  'citizen@demo.resqnet.app',
  'eoc@demo.resqnet.app',
  'rescue@demo.resqnet.app',
  'hospital@demo.resqnet.app',
  'shelter@demo.resqnet.app',
  'volunteer@demo.resqnet.app',
];

// Tiny valid image fixture. This is visibly labelled as a sample document in
// its filename and must never be mistaken for real organization verification.
const SAMPLE_DOCUMENT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

function buildDemoData({ now = new Date(), aiService, trustService, userIds = IDS.users }) {
  const ago = (days, hours = 0) => new Date(now.getTime() - (days * 86400000 + hours * 3600000));
  const approvedDoc = (fileName) => ({
    dataUrl: SAMPLE_DOCUMENT,
    fileName: `DEMO-SAMPLE-${fileName}`,
    status: 'approved',
    reviewedBy: userIds.eoc,
    reviewNote: 'Demo fixture only; no real identity review was performed.',
    uploadedAt: ago(30),
    reviewedAt: ago(29),
  });
  const pendingDoc = (fileName) => ({
    dataUrl: SAMPLE_DOCUMENT,
    fileName: `DEMO-SAMPLE-${fileName}`,
    status: 'pending',
    uploadedAt: ago(1),
  });

  const users = [
    { _id: userIds.citizen, email: DEMO_EMAILS[0], name: 'Aarav Sharma', role: 'citizen', phone: '+91 98200 00001', location: { coordinates: [72.861, 19.043] }, safetyStatus: 'safe' },
    { _id: userIds.eoc, email: DEMO_EMAILS[1], name: 'Mumbai EOC Duty Officer', role: 'eoc', organizationName: 'Mumbai Disaster Management Cell', phone: '+91 22 2262 0101', location: { coordinates: [72.8777, 19.076] } },
    { _id: userIds.rescue, email: DEMO_EMAILS[2], name: 'NDRF Team 4', role: 'rescue_team', organizationName: 'National Disaster Response Force — Mumbai Unit', phone: '+91 98200 00099', location: { coordinates: [72.85, 19.04] }, verificationDocument: approvedDoc('rescue-organization.png') },
    { _id: userIds.hospital, email: DEMO_EMAILS[3], name: 'Sion Hospital Duty Administrator', role: 'hospital', organizationName: 'Lokmanya Tilak Municipal General Hospital', phone: '+91 22 2407 6381', location: { coordinates: [72.8619, 19.0448] }, verificationDocument: approvedDoc('hospital-registration.png') },
    { _id: userIds.shelter, email: DEMO_EMAILS[4], name: 'BKC Relief Camp Coordinator', role: 'shelter', organizationName: 'Bandra Kurla Community Relief Centre', phone: '+91 98200 00022', location: { coordinates: [72.8656, 19.0669] }, verificationDocument: approvedDoc('shelter-registration.png') },
    { _id: userIds.volunteer, email: DEMO_EMAILS[5], name: 'Mira Deshpande', role: 'volunteer', organizationName: 'Mumbai Community Response Network', phone: '+91 98200 00033', location: { coordinates: [72.8437, 19.0176] }, verificationDocument: pendingDoc('volunteer-id.png') },
  ];

  const facilities = [
    { _id: IDS.facilities.sionShelter, type: 'shelter', name: 'BKC Community Relief Centre', location: { coordinates: [72.8656, 19.0669], address: 'Bandra Kurla Complex, Mumbai' }, capacityTotal: 200, capacityUsed: 146, contactPhone: '+91 98200 00022', managedBy: userIds.shelter, status: 'operational' },
    { _id: IDS.facilities.dadarShelter, type: 'shelter', name: 'Dadar Municipal School Relief Shelter', location: { coordinates: [72.8437, 19.0176], address: 'Gokhale Road, Dadar West, Mumbai' }, capacityTotal: 120, capacityUsed: 120, contactPhone: '+91 22 2422 1800', status: 'full' },
    { _id: IDS.facilities.kurlaShelter, type: 'shelter', name: 'Kurla East Transit Shelter', location: { coordinates: [72.8792, 19.0651], address: 'LBS Marg, Kurla East, Mumbai' }, capacityTotal: 90, capacityUsed: 34, contactPhone: '+91 22 2650 4400', status: 'operational' },
    { _id: IDS.facilities.sionHospital, type: 'hospital', name: 'Lokmanya Tilak Municipal General Hospital', location: { coordinates: [72.8619, 19.0448], address: 'Sion, Mumbai' }, capacityTotal: 80, capacityUsed: 61, resources: ['ICU', 'ambulance', 'oxygen', 'emergency department', 'trauma care'], contactPhone: '+91 22 2407 6381', managedBy: userIds.hospital, status: 'operational' },
    { _id: IDS.facilities.kemHospital, type: 'hospital', name: 'King Edward Memorial Hospital', location: { coordinates: [72.8417, 19.0006], address: 'Acharya Donde Marg, Parel, Mumbai' }, capacityTotal: 100, capacityUsed: 88, resources: ['ICU', 'oxygen', 'blood bank', 'burn unit'], contactPhone: '+91 22 2410 7000', status: 'operational' },
    { _id: IDS.facilities.bkcHospital, type: 'hospital', name: 'Bandra Urban Emergency Clinic', location: { coordinates: [72.8354, 19.0596], address: 'Bandra West, Mumbai' }, capacityTotal: 40, capacityUsed: 40, resources: ['first aid', 'ambulance', 'oxygen'], contactPhone: '+91 22 2642 2200', status: 'full' },
  ].map((facility) => ({ ...facility, isDemoData: true }));

  const incidentFixtures = [
    { id: 'hindmataSos', type: 'sos', title: 'Family stranded on a rooftop as water rises', description: 'Four residents, including an infant, are stranded on the roof of a two-storey home. Water is rising quickly and the ground-floor exits are submerged.', category: 'flood', severity: 'critical', status: 'reported', coords: [72.8339, 19.0016], address: 'Hindmata Junction, Dadar East, Mumbai', days: 0, hours: 1, authority: 'pending', confirms: 3, disputes: 0, gps: 'match', confidence: 91, escalated: true },
    { id: 'sionRoad', type: 'incident_report', title: 'Waterlogging has blocked Sion Circle', description: 'Knee-deep water is blocking the service road near Sion Circle. Two buses are stalled and traffic is backing up toward the hospital entrance.', category: 'flood', severity: 'medium', status: 'acknowledged', coords: [72.861, 19.043], address: 'Sion Circle, Sion, Mumbai', days: 0, hours: 3, authority: 'confirmed', confirms: 2, disputes: 0, gps: 'match', confidence: 78, note: 'Traffic police notified; water level being monitored.' },
    { id: 'bkcSupplies', type: 'resource_request', title: 'Drinking water and dry rations needed at BKC camp', description: 'The relief centre is supporting 146 displaced residents. Drinking water, oral rehydration solution and dry food are needed before the evening distribution.', category: 'other', severity: 'high', status: 'dispatched', coords: [72.8656, 19.0669], address: 'Bandra Kurla Complex, Mumbai', days: 0, hours: 5, authority: 'confirmed', confirms: 2, disputes: 0, gps: 'match', confidence: 86, assigned: true, note: 'Supply vehicle dispatched from the municipal depot.' },
    { id: 'kurlaMedical', type: 'sos', title: 'Urgent medical evacuation from flooded building', description: 'An older resident with breathing difficulty is on the first floor. The building approach is under water and an ambulance cannot reach the front gate.', category: 'medical', severity: 'critical', status: 'in_progress', coords: [72.850, 19.055], address: 'Nehru Nagar, Kurla East, Mumbai', days: 0, hours: 2, authority: 'confirmed', confirms: 2, disputes: 0, gps: 'match', confidence: 93, assigned: true, note: 'Rescue crew is transferring the patient to Sion Hospital.' },
    { id: 'dadarElectrical', type: 'incident_report', title: 'Electrical arcing reported beside flooded market', description: 'Residents report repeated sparks from a street distribution box beside floodwater. The immediate block has been cordoned off pending utility inspection.', category: 'other', severity: 'high', status: 'rejected', coords: [72.845, 19.019], address: 'Dadar Market, Dadar West, Mumbai', days: 0, hours: 8, authority: 'rejected', confirms: 0, disputes: 2, gps: 'mismatch', confidence: 32, note: 'Utility crew found no active fault; report was made from a distant location.' },
    { id: 'parelBuilding', type: 'incident_report', title: 'Cracks reported in retaining wall near Parel', description: 'A retaining wall beside the construction access lane has developed a visible crack after prolonged rain. No collapse or injuries reported; area is closed for inspection.', category: 'structural', severity: 'medium', status: 'resolved', coords: [72.8417, 19.0006], address: 'Parel, Mumbai', days: 1, hours: 1, authority: 'confirmed', confirms: 1, disputes: 0, gps: 'match', confidence: 74, note: 'Municipal engineer inspected and secured the wall.' },
    { id: 'bycullaFire', type: 'sos', title: 'Smoke visible from ground-floor electrical room', description: 'Smoke is coming from the electrical room of a residential block. Residents have evacuated to the street; building staff have isolated the main supply.', category: 'fire', severity: 'critical', status: 'dispatched', coords: [72.8336, 18.9763], address: 'Byculla West, Mumbai', days: 0, hours: 1, authority: 'confirmed', confirms: 1, disputes: 0, gps: 'unknown', confidence: 84, assigned: true, note: 'Fire response unit dispatched; residents accounted for.' },
    { id: 'duplicateHindmata', type: 'incident_report', title: 'People trapped near Hindmata in rising floodwater', description: 'A second caller reports the same rooftop rescue near Hindmata. Location and affected household match the earlier SOS report.', category: 'flood', severity: 'high', status: 'merged', coords: [72.8341, 19.0018], address: 'Hindmata Junction, Dadar East, Mumbai', days: 0, hours: 1, authority: 'confirmed', confirms: 1, disputes: 0, gps: 'match', confidence: 82, duplicate: 'hindmataSos', note: 'Merged into the primary Hindmata rescue incident.' },
    { id: 'chemburMissing', type: 'missing_person', title: 'Elderly resident unaccounted for after evacuation', description: 'A 72-year-old resident was last seen near the building entrance during evacuation. Family is at the local ward help desk; police have been informed.', category: 'other', severity: 'low', status: 'reported', coords: [72.8988, 19.0522], address: 'Chembur, Mumbai', days: 0, hours: 6, authority: 'pending', confirms: 0, disputes: 0, gps: 'unknown', confidence: 58 },
    { id: 'thaneTremor', type: 'incident_report', title: 'Minor tremor felt in high-rise; stairwell inspection requested', description: 'Residents felt brief shaking and noticed fresh plaster dust in a stairwell. No injuries or visible structural failure reported. Building management has restricted lift use pending inspection.', category: 'earthquake', severity: 'high', status: 'acknowledged', coords: [72.9781, 19.2183], address: 'Thane West, Thane District', days: 0, hours: 4, authority: 'pending', confirms: 1, disputes: 0, gps: 'match', confidence: 69, note: 'Ward engineering team requested to inspect the common areas.' },
  ];

  const incidents = incidentFixtures.map((item) => {
    const incidentId = IDS.incidents[item.id];
    const createdAt = ago(item.days, item.hours);
    const authorityVerification = {
      status: item.authority,
      verifiedBy: item.authority === 'pending' ? null : userIds.eoc,
      note: item.note || '',
      ...(item.authority === 'pending' ? {} : { at: new Date(createdAt.getTime() + 20 * 60000) }),
    };
    const crowdVotes = [
      ...[userIds.eoc, userIds.shelter, userIds.hospital].slice(0, item.confirms).map((user, i) => ({ user, vote: 'confirm', at: new Date(createdAt.getTime() + (i + 1) * 5 * 60000) })),
      ...[userIds.rescue, userIds.volunteer].slice(0, item.disputes).map((user, i) => ({ user, vote: 'dispute', at: new Date(createdAt.getTime() + (i + 1) * 7 * 60000) })),
    ];
    const aiAnalysis = {
      summary: aiService.buildShortSummary({ text: `${item.title} ${item.description}`, category: item.category, severity: item.severity }),
      suggestedSeverity: item.severity,
      suggestedCategory: item.category,
      suggestedResources: [],
      ...aiService.computeResourceRecommendation({ category: item.category, severity: item.severity }),
      confidence: item.confidence,
      generatedAt: new Date(createdAt.getTime() + 2 * 60000),
      source: 'mock',
    };
    const reporterCoords = item.gps === 'match' ? item.coords : item.gps === 'mismatch' ? [72.98, 19.20] : null;
    const verification = trustService.computeTrustScore({ incidentCoords: item.coords, reporterCoords, votes: crowdVotes, authorityVerification, aiAnalysis });
    const timeline = [{ status: 'reported', note: 'Incident received through ResQNet demo reporting channel.', actor: userIds.citizen, at: createdAt }];
    if (['acknowledged', 'dispatched', 'in_progress', 'resolved', 'rejected', 'merged'].includes(item.status)) {
      timeline.push({ status: item.status, note: item.note || `Status updated to ${item.status.replace('_', ' ')} by Mumbai EOC.`, actor: userIds.eoc, at: new Date(createdAt.getTime() + 35 * 60000) });
    }
    return {
      _id: incidentId,
      type: item.type,
      title: item.title,
      description: item.description,
      category: item.category,
      severity: item.severity,
      status: item.status,
      location: { type: 'Point', coordinates: item.coords, address: item.address },
      reportedBy: userIds.citizen,
      ...(item.assigned ? { assignedTeam: userIds.rescue } : {}),
      aiAnalysis,
      reporterLocation: reporterCoords ? { type: 'Point', coordinates: reporterCoords } : undefined,
      crowdVotes,
      authorityVerification,
      verification,
      escalated: item.escalated ?? trustService.shouldEscalate({ severity: item.severity, status: item.status, trustState: verification.trustState }),
      ...(item.duplicate ? { duplicateOf: IDS.incidents[item.duplicate] } : {}),
      timeline,
      isDemoData: true,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + 40 * 60000),
    };
  });

  const alerts = [
    { _id: IDS.alerts.flood, message: 'FLASH FLOOD WATCH: Avoid low-lying roads around Hindmata, Dadar and Sion. Move to higher floors and follow instructions from local responders.', severity: 'critical', active: true },
    { _id: IDS.alerts.evacuation, message: 'Relief shelter open at the BKC Community Relief Centre. Bring essential medicines and identification; assistance is available at the entrance.', severity: 'warning', active: true },
    { _id: IDS.alerts.hospital, message: 'Sion Hospital emergency department is operational. KEM Hospital is receiving trauma cases; call emergency services before travelling.', severity: 'info', active: true },
  ].map((alert) => ({ ...alert, issuedBy: userIds.eoc, isDemoData: true }));

  return { users, facilities, incidents, alerts };
}

module.exports = { IDS, DEMO_EMAILS, DEMO_PASSWORD, buildDemoData };
