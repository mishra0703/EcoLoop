const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Reads the JWT from the httpOnly cookie (preferred) or an Authorization:
 * Bearer header (fallback, handy for testing with curl/Postman), verifies
 * it, loads the user, and attaches it as req.user. Any downstream route
 * can assume req.user exists once this has run.
 */
async function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.cookies?.ecoloop_token || bearer;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

module.exports = { requireAuth };
