const express = require('express');
const router = express.Router();
const multGameController = require('../controllers/multGameController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/active-games', authenticateToken, multGameController.getActiveGames);
router.post('/create', authenticateToken, multGameController.createGame);
router.post('/join', authenticateToken, multGameController.joinGame);
router.get('/stats', authenticateToken, multGameController.getStats);
router.post('/abandon', authenticateToken, multGameController.abandonGame);


module.exports = router;