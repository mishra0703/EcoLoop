const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const { computeStats } = require('../services/stats.service');
const { todayStr } = require('../utils/date');

/**
 * POST /api/logs/toggle
 * body: { habitId, date? }  — date defaults to today, format 'YYYY-MM-DD'
 *
 * Upserts the log for that user+habit+day and flips `completed`. This is
 * the single endpoint the "Log Habit" checklist page calls on every click.
 */
async function toggleLog(req, res, next) {
  try {
    const { habitId, date } = req.body;
    const targetDate = date || todayStr();

    if (!habitId) {
      return res.status(400).json({ error: 'habitId is required.' });
    }

    const habit = await Habit.findOne({
      _id: habitId,
      $or: [{ type: 'fixed' }, { userId: req.user._id }],
    });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    const existing = await HabitLog.findOne({ userId: req.user._id, habitId, date: targetDate });

    let log;
    if (existing) {
      existing.completed = !existing.completed;
      log = await existing.save();
    } else {
      log = await HabitLog.create({ userId: req.user._id, habitId, date: targetDate, completed: true });
    }

    res.json({ log });
  } catch (err) {
    next(err);
  }
}

/** GET /api/logs?date=YYYY-MM-DD — which habits are completed for a given day (defaults to today). */
async function getLogsForDate(req, res, next) {
  try {
    const date = req.query.date || todayStr();
    const logs = await HabitLog.find({ userId: req.user._id, date });
    res.json({ date, logs });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/logs/stats
 * Computed dashboard/stats payload: currentStreak, longestStreak,
 * totalCo2Saved, heatmapCells — everything derived server-side in one pass.
 */
async function getStats(req, res, next) {
  try {
    const stats = await computeStats(req.user._id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleLog, getLogsForDate, getStats };
