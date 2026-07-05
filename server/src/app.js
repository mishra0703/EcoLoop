const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const habitRoutes = require('./routes/habit.routes');
const logRoutes = require('./routes/log.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:4200',
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on our end.',
  });
});

module.exports = app;
