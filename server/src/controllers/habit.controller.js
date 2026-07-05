const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

/** GET /api/habits — every fixed/global habit plus this user's custom ones. */
async function getHabits(req, res, next) {
  try {
    const habits = await Habit.find({
      $or: [{ type: 'fixed' }, { userId: req.user._id }],
    }).sort({ type: 1, createdAt: 1 });

    res.json({ habits });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/habits — creates a custom habit.
 * Expects { name, co2Estimate } already produced by POST /api/ai/validate-habit
 * (see ai.controller.js) — this endpoint does NOT re-run the Gemini check,
 * it just persists what the validation step already approved.
 */
async function createCustomHabit(req, res, next) {
  try {
    const { name, co2Estimate, icon } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required.' });
    }
    if (typeof co2Estimate !== 'number' || co2Estimate < 0) {
      return res.status(400).json({ error: 'co2Estimate must be a non-negative number.' });
    }

    const habit = await Habit.create({
      userId: req.user._id,
      name: name.trim(),
      icon: icon || '🌱',
      type: 'custom',
      isCustom: true,
      co2Estimate,
    });

    res.status(201).json({ habit });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You already have a custom habit with that name.' });
    }
    next(err);
  }
}

/** DELETE /api/habits/:id — only the owning user can delete their own custom habit. */
async function deleteCustomHabit(req, res, next) {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id, type: 'custom' });

    if (!habit) {
      return res.status(404).json({ error: 'Custom habit not found.' });
    }

    await HabitLog.deleteMany({ habitId: habit._id, userId: req.user._id });
    await habit.deleteOne();

    res.json({ message: 'Habit deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHabits, createCustomHabit, deleteCustomHabit };
