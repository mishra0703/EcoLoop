const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { getHabits, createCustomHabit, deleteCustomHabit } = require('../controllers/habit.controller');

const router = express.Router();

router.use(requireAuth); 

router.get('/', getHabits);
router.post('/', createCustomHabit);
router.delete('/:id', deleteCustomHabit);

module.exports = router;
