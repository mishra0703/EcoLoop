const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateHabit, getNudge } = require('../controllers/ai.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/validate-habit', validateHabit);
router.get('/nudge', getNudge);

module.exports = router;
