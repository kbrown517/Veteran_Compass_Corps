/**
 * Main server file for Veteran Compass Corps
 * This file sets up and starts the Express server
 */

// Load environment variables from .env file
require('dotenv').config();

// Import Express framework
const express = require('express');

// Import our route handlers
const healthRoutes = require('./routes/health');
const { handleChat } = require('./src/routes/chat');

// Create an Express application
const app = express();

// Middleware: Parse JSON request bodies
// This allows us to read JSON data sent in POST/PUT requests
app.use(express.json());

// Middleware: Parse URL-encoded request bodies
// This allows us to read form data sent in requests
app.use(express.urlencoded({ extended: true }));

// Use our route handlers
// Health check route
app.use('/', healthRoutes);

// Chat API route
app.post('/api/chat', handleChat);

// Set the port number
// process.env.PORT allows hosting platforms (like Replit) to set the port
// If not set, we default to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check available at: http://localhost:${PORT}/health`);
});

