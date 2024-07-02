const express = require('express');
const router = express.Router();
const multGameplayController = require('../controllers/multGameplayController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes are prefixed with /api/mult/gameplay

// Get details of a specific game
router.get('/:id', authenticateToken, multGameplayController.getGameDetails);

// Set secret number for a player
router.post('/:id/set-secret', authenticateToken, multGameplayController.setSecretNumber);

module.exports = router;