const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { toggleLog, getLogsForDate, getStats } = require('../controllers/log.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', getLogsForDate);
router.get('/stats', getStats);
router.post('/toggle', toggleLog);

module.exports = router;
