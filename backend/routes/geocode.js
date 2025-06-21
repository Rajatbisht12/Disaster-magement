const express = require('express');
const router = express.Router();
const geocodeController = require('../controllers/geocodeController');
const { ClerkExpressWithAuth } = require('../helpers');

// POST /geocode - Geocode location (public with auth context)
router.post('/', ClerkExpressWithAuth(), geocodeController.geocodeLocation);

module.exports = router; 