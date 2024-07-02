const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getTotalUsers, getUserDetails } = require('../controllers/userController');

// testing purposes to check if protected routes work
router.get('/details', authenticateToken, getUserDetails);
router.get('/count', getTotalUsers);

module.exports = router;