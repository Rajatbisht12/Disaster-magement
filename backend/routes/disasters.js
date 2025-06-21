const express = require('express');
const router = express.Router();
const disastersController = require('../controllers/disastersController');
const { ClerkExpressRequireAuth, ClerkExpressWithAuth, requireRole } = require('../helpers');

// POST /disasters - Create disaster (requires admin)
router.post('/', ClerkExpressRequireAuth(), requireRole('admin'), disastersController.createDisaster);

// GET /disasters - Get all disasters (public, but with auth context)
router.get('/', ClerkExpressWithAuth(), disastersController.getDisasters);

// PUT /disasters/:id - Update disaster (requires admin)
router.put('/:id', ClerkExpressRequireAuth(), requireRole('admin'), disastersController.updateDisaster);

// DELETE /disasters/:id - Delete disaster (requires admin)
router.delete('/:id', ClerkExpressRequireAuth(), requireRole('admin'), disastersController.deleteDisaster);

// GET /disasters/:id/social-media - Get social media for disaster (public)
router.get('/:id/social-media', ClerkExpressWithAuth(), disastersController.getSocialMedia);

// GET /disasters/:id/resources - Get nearby resources (public)
router.get('/:id/resources', ClerkExpressWithAuth(), disastersController.getNearbyResources);

// GET /disasters/:id/official-updates - Get official updates (public)
router.get('/:id/official-updates', ClerkExpressWithAuth(), disastersController.getOfficialUpdates);

// POST /disasters/:id/verify-image - Verify image (public)
router.post('/:id/verify-image', ClerkExpressWithAuth(), disastersController.verifyImage);

module.exports = router;