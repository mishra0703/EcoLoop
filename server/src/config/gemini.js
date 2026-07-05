/**
 * Thin wrapper around the Gemini API (free tier via Google AI Studio).
 * No SDK dependency — a single fetch call keeps this easy to swap models
 * or providers later without touching the controllers that use it.
 */
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Sends a single prompt to Gemini and returns the raw text response.
 * Throws if the API key is missing or the request fails, so callers can
 * decide how to degrade (see ai.controller.js for the fallback behavior).
 */
async function generateText(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set.');
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 200 },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini returned no text.');
  }

  return text.trim();
}

module.exports = { generateText };
