/**
 * Seeds the fixed/global habits once. Safe to re-run — it upserts by name
 * so it won't create duplicates.
 *
 * Usage:  node src/utils/seedHabits.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Habit = require('../models/Habit');

const FIXED_HABITS = [
  { name: 'Walked or biked instead of driving', icon: '🚲', co2Estimate: 2.6 },
  { name: 'Ate a plant-based meal', icon: '🌾', co2Estimate: 1.9 },
  { name: 'Used a reusable bottle or bag', icon: '♻️', co2Estimate: 0.3 },
  { name: 'Air-dried laundry', icon: '🧺', co2Estimate: 1.1 },
  { name: 'Reduced food waste', icon: '🥕', co2Estimate: 0.8 },
  { name: 'Turned off unused electronics', icon: '🔌', co2Estimate: 0.4 },
  { name: 'Took a shorter shower', icon: '🚿', co2Estimate: 0.5 },
];

async function seed() {
  await connectDB();

  for (const h of FIXED_HABITS) {
    await Habit.findOneAndUpdate(
      { name: h.name, type: 'fixed' },
      { ...h, type: 'fixed', isCustom: false, userId: null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[seed] upserted: ${h.name}`);
  }

  console.log('[seed] done.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
