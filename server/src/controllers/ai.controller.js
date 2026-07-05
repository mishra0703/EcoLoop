const { generateText } = require('../config/gemini');
const { computeStats } = require('../services/stats.service');

const ECO_KEYWORD_FALLBACK = /(bike|walk|plant|compost|recycl|reus|solar|energy|water|waste|garden|thrift|second-hand|public transport|bus|train|carpool|unplug|led|meat|vegan|vegetarian|local|organic|bag|bottle|electric|repair|donate)/i;

function stripCodeFences(text) {
  return text.replace(/```json|```/g, '').trim();
}

/**
 * POST /api/ai/validate-habit
 * body: { name: string }
 *
 * Asks Gemini whether the proposed habit is genuinely eco-friendly, and if
 * so, a rough kg-CO2-saved-per-completion estimate. Falls back to a simple
 * keyword heuristic if Gemini is unreachable/misconfigured, so a missing
 * API key degrades gracefully instead of breaking the Log Habit page.
 */
async function validateHabit(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required.' });
    }
    const habitName = name.trim();

    const prompt = `You are validating a user-submitted daily habit for an eco-habit tracking app.
Habit: "${habitName}"

Decide if this habit is genuinely eco-friendly / environmentally beneficial.
Respond with ONLY raw JSON, no markdown, no code fences, no preamble, matching exactly this shape:

If eco-friendly:
{"valid": true, "co2Estimate": <number, rough kg of CO2 saved per single completion, between 0.1 and 5>}

If NOT eco-friendly (or too vague to tell):
{"valid": false, "reason": "<one short friendly sentence explaining why it doesn't look eco-related>", "suggestion": "<a rephrased example of a genuinely eco-friendly version of what they might have meant>"}`;

    try {
      const raw = await generateText(prompt);
      const parsed = JSON.parse(stripCodeFences(raw));

      if (typeof parsed.valid !== 'boolean') {
        throw new Error('Malformed Gemini response.');
      }

      return res.json(parsed);
    } catch (geminiErr) {
      console.warn('[ai] Gemini validation failed, using fallback heuristic:', geminiErr.message);
      if (!ECO_KEYWORD_FALLBACK.test(habitName)) {
        return res.json({
          valid: false,
          reason: "That doesn't look eco-related yet.",
          suggestion: `Try something like "Composted kitchen scraps" or "${habitName} using public transport"`,
        });
      }
      return res.json({ valid: true, co2Estimate: 0.8 });
    }
  } catch (err) {
    next(err);
  }
}

const STATIC_NUDGES = [
  "Three days deep in your streak — the soil's starting to notice.",
  "You've saved enough CO₂ this week to power a laptop for a day.",
  'Consistency beats intensity. One habit, logged daily, outgrows ten skipped ones.',
  'Your longest streak is within reach — one more day gets you there.',
  "Small loop, real impact. Keep today's habit simple and log it.",
];

/**
 * GET /api/ai/nudge
 * Generates a short, personalized motivational line based on the user's
 * actual streak and CO2 total. Falls back to a static rotating message if
 * Gemini is unavailable.
 */
async function getNudge(req, res, next) {
  try {
    const stats = await computeStats(req.user._id);

    const prompt = `You write short, warm, non-cheesy motivational nudges for an eco-habit tracking app.
User context:
- Current streak: ${stats.currentStreak} days
- Longest streak: ${stats.longestStreak} days
- Total CO2 saved so far: ${stats.totalCo2Saved} kg

Write ONE short sentence (under 25 words) that references their actual numbers naturally.
No emoji, no hashtags, no exclamation points, no markdown. Respond with ONLY the sentence, nothing else.`;

    try {
      const nudge = await generateText(prompt);
      return res.json({ nudge: nudge.replace(/^"|"$/g, '') });
    } catch (geminiErr) {
      console.warn('[ai] Gemini nudge failed, using fallback:', geminiErr.message);
      const idx = stats.currentStreak % STATIC_NUDGES.length;
      return res.json({ nudge: STATIC_NUDGES[idx] });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { validateHabit, getNudge };
