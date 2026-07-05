const { signToken } = require('../utils/jwt');

const COOKIE_NAME = 'ecoloop_token';
const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProd, 
  sameSite: isProd ? 'none' : 'lax', 
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};

/**
 * Hit after passport.authenticate('google') succeeds — req.user is the
 * Mongoose user doc from passport.js. We issue our own JWT, set it as an
 * httpOnly cookie, and redirect back to the Angular app.
 */
function googleCallback(req, res) {
  const token = signToken(req.user._id.toString());
  res.cookie(COOKIE_NAME, token, cookieOptions);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
  res.redirect(`${clientUrl}/dashboard`);
}

function getMe(req, res) {
  res.json({ user: req.user });
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out.' });
}

async function updatePreferences(req, res) {
  const { unitPreference } = req.body;

  if (!['kg', 'lbs'].includes(unitPreference)) {
    return res.status(400).json({ error: "unitPreference must be 'kg' or 'lbs'." });
  }

  req.user.unitPreference = unitPreference;
  await req.user.save();
  res.json({ user: req.user });
}

module.exports = { googleCallback, getMe, logout, updatePreferences, COOKIE_NAME };
