const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/new', gameController.startNewGame);
router.post('/guess', gameController.makeGuess);

module.exports = router;