const mongoose = require('mongoose');

/**
 * Connects to MongoDB (Atlas in production, local/Atlas free tier in dev).
 * Called once from server.js on boot. Fails loudly on purpose — an API
 * with no DB connection should not silently accept requests.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[db] MONGO_URI is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });
}

module.exports = connectDB;
