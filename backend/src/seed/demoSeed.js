// Maintain the ResQNet demo dataset. Run from backend/ with `npm run seed`.
// `npm run seed:dry-run` only describes the fixture and never connects to MongoDB.
const mongoose = require('mongoose');
const User = require('../models/User');
const Incident = require('../models/Incident');
const Facility = require('../models/Facility');
const Alert = require('../models/Alert');
const aiService = require('../services/aiService');
const trustService = require('../services/trustScoreService');
const { IDS, DEMO_EMAILS, DEMO_PASSWORD, buildDemoData } = require('./demoData');

const isDryRun = process.argv.includes('--dry-run') || process.env.SEED_DRY_RUN === 'true';

function describePlan(data) {
  console.log('[seed] Dry run: no MongoDB connection or writes will be made.');
  console.log(`[seed] Would upsert ${data.users.length} users: ${DEMO_EMAILS.join(', ')}`);
  console.log(`[seed] Would upsert ${data.facilities.length} facilities, ${data.incidents.length} incidents, and ${data.alerts.length} active alerts.`);
  console.log(`[seed] UI demo password: ${DEMO_PASSWORD} (demo use only)`);
  console.log('[seed] Reruns update records with the same fixed IDs. Cleanup is limited to stale incident, facility, and alert records already marked isDemoData:true.');
}

function assertDemoIdAvailable(Model, id, email) {
  return Model.findById(id).then((existing) => {
    if (existing && email && existing.email !== email) {
      throw new Error(`Refusing to reuse a reserved demo ID for a different ${Model.modelName} account.`);
    }
    if (existing && !email && existing.isDemoData !== true) {
      throw new Error(`Refusing to overwrite a non-demo ${Model.modelName} record at a reserved demo ID.`);
    }
  });
}

async function upsertUser(fixture) {
  // Exact allowlisted emails intentionally migrate users made by the previous
  // seed version, which did not have the isDemoData marker or stable IDs.
  let user = await User.findOne({ email: fixture.email });
  if (!user) {
    await assertDemoIdAvailable(User, fixture._id, fixture.email);
    user = new User({ ...fixture, password: DEMO_PASSWORD, isDemoData: true });
  } else if (user.role !== fixture.role || !DEMO_EMAILS.includes(user.email)) {
    throw new Error(`Refusing to adopt ${fixture.email}: it does not match the expected demo role/account allowlist.`);
  } else {
    user.set({
      name: fixture.name,
      email: fixture.email,
      password: DEMO_PASSWORD,
      role: fixture.role,
      organizationName: fixture.organizationName,
      phone: fixture.phone,
      location: fixture.location,
      safetyStatus: fixture.safetyStatus || 'unknown',
      verificationDocument: fixture.verificationDocument || { status: 'not_submitted' },
      isDemoData: true,
    });
  }
  await user.save();
  return user;
}

async function upsertOwnedRecord(Model, fixture) {
  const existing = await Model.findById(fixture._id);
  if (existing && existing.isDemoData !== true) {
    throw new Error(`Refusing to overwrite a non-demo ${Model.modelName} at a reserved demo ID.`);
  }
  if (!existing) return new Model(fixture).save();
  existing.set(fixture);
  return existing.save();
}

async function runSeed() {
  const initialData = buildDemoData({ aiService, trustService });
  if (isDryRun) {
    describePlan(initialData);
    return;
  }

  // Load local configuration only for an actual write run. Dry runs don't
  // inspect environment files and never read MONGO_URI.
  require('dotenv').config();
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED_IN_PRODUCTION !== 'true') {
    throw new Error('Refusing to seed in production. Set ALLOW_DEMO_SEED_IN_PRODUCTION=true only for an intentional demo database.');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. No database was connected or changed.');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[seed] Connected to MongoDB. Maintaining the allowlisted ResQNet demo records…');

    // Preserve the actual IDs of exact allowlisted accounts when upgrading the
    // older seed, so existing references are replaced consistently.
    const actualUserIds = {};
    for (const fixture of initialData.users) {
      const user = await upsertUser(fixture);
      const key = Object.entries(IDS.users).find(([, id]) => id === fixture._id)?.[0];
      if (key) actualUserIds[key] = user._id;
    }

    const data = buildDemoData({ aiService, trustService, userIds: actualUserIds });
    for (const facility of data.facilities) await upsertOwnedRecord(Facility, facility);
    for (const incident of data.incidents) await upsertOwnedRecord(Incident, incident);
    for (const alert of data.alerts) await upsertOwnedRecord(Alert, alert);

    const keepFacilityIds = data.facilities.map((record) => record._id);
    const keepIncidentIds = data.incidents.map((record) => record._id);
    const keepAlertIds = data.alerts.map((record) => record._id);

    // Cleanup is limited to positively marked demo records, and happens only
    // after all current fixtures were written successfully.
    const [oldFacilities, oldIncidents, oldAlerts] = await Promise.all([
      Facility.deleteMany({ isDemoData: true, _id: { $nin: keepFacilityIds } }),
      Incident.deleteMany({ isDemoData: true, _id: { $nin: keepIncidentIds } }),
      Alert.deleteMany({ isDemoData: true, _id: { $nin: keepAlertIds } }),
    ]);

    console.log(`[seed] Updated ${data.users.length} demo accounts, ${data.facilities.length} facilities, ${data.incidents.length} incidents, and ${data.alerts.length} alerts.`);
    console.log(`[seed] Removed stale records already marked as demo data: ${oldFacilities.deletedCount} facilities, ${oldIncidents.deletedCount} incidents, ${oldAlerts.deletedCount} alerts.`);
    console.log(`[seed] Demo-only password: ${DEMO_PASSWORD}`);
    for (const email of DEMO_EMAILS) console.log(`  ${email}`);
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

runSeed().catch((error) => {
  console.error(`[seed] Failed: ${error.message}`);
  process.exitCode = 1;
});
