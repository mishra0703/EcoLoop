const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { todayStr, shiftDateStr } = require('../utils/date');

const HEATMAP_DAYS = 371; 

function levelForCount(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/**
 * Computes everything the dashboard/stats pages need in one pass:
 * current streak, longest streak (within the heatmap window), total CO2
 * saved, and the per-day heatmap cells. Kept in one function so we only
 * hit the DB once per request instead of once per stat.
 */
async function computeStats(userId) {
  const today = todayStr();
  const windowStart = shiftDateStr(today, -(HEATMAP_DAYS - 1));

  const [habits, logs] = await Promise.all([
    Habit.find({ $or: [{ type: 'fixed' }, { userId }] }),
    HabitLog.find({ userId, completed: true, date: { $gte: windowStart } }),
  ]);

  const co2ByHabit = new Map(habits.map((h) => [h._id.toString(), h.co2Estimate]));

  const countByDate = new Map();
  let totalCo2Saved = 0;

  for (const log of logs) {
    countByDate.set(log.date, (countByDate.get(log.date) ?? 0) + 1);
    totalCo2Saved += co2ByHabit.get(log.habitId.toString()) ?? 0;
  }

  const heatmapCells = [];
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const date = shiftDateStr(today, -i);
    const count = countByDate.get(date) ?? 0;
    heatmapCells.push({ date, count, level: levelForCount(count) });
  }

  let currentStreak = 0;
  let cursor = (countByDate.get(today) ?? 0) > 0 ? today : shiftDateStr(today, -1);
  while ((countByDate.get(cursor) ?? 0) > 0) {
    currentStreak++;
    cursor = shiftDateStr(cursor, -1);
  }

  let longestStreak = 0;
  let running = 0;
  for (const cell of heatmapCells) {
    if (cell.count > 0) {
      running++;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }


  const rawLogs = logs.map((l) => ({
    _id: l._id.toString(),
    habitId: l.habitId.toString(),
    date: l.date,
    completed: l.completed,
  }));

  return {
    currentStreak,
    longestStreak,
    totalCo2Saved: Math.round(totalCo2Saved * 10) / 10,
    heatmapCells,
    logs: rawLogs,
  };
}

module.exports = { computeStats };
