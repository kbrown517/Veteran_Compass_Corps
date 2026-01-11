/**
 * Health check route
 * This file contains routes for checking if the server is running properly
 */

// Import Express Router to create route handlers
const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Simple endpoint to check if the server is running
 * Returns a JSON response with status and timestamp
 */
router.get('/health', (req, res) => {
  // Send a JSON response with status information
  res.json({
    status: 'ok',
    message: 'Veteran Compass Corps API is running',
    timestamp: new Date().toISOString()
  });
});

// Export the router so it can be used in server.js
module.exports = router;

