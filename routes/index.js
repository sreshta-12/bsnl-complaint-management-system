const express = require('express');
const router = express.Router();
const HomePageController = require('../controllers/HomePageController');

// Homepage – allow all users
router.get('/', HomePageController.homePage);

// Protected route (requires login)
router.get('/filterDashboard', require('../middleware/auth').checkAuthenticated, HomePageController.filterDashboard);

module.exports = router;
