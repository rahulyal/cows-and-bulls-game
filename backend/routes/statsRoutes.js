const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.post('/update', statsController.updateGlobalStats);
router.get('/global', statsController.getGlobalStats);

module.exports = router;