const express = require('express');
const router = express.Router();
const userGameController = require('../controllers/userGameController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/active', authenticateToken, userGameController.getActiveGame);
router.post('/new', authenticateToken, userGameController.startNewGame);
router.post('/guess', authenticateToken, userGameController.makeGuess);
router.get('/:id', authenticateToken, userGameController.getGameState);
router.get('/stats', authenticateToken, userGameController.getUserStats);

module.exports = router;