/** Returns today's date as 'YYYY-MM-DD' (server's local time). */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Shifts a 'YYYY-MM-DD' string by `days` (can be negative) and returns a new 'YYYY-MM-DD' string. */
function shiftDateStr(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

module.exports = { todayStr, shiftDateStr };
