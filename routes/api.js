const express = require('express');
const router = express.Router();
const RequestLog = require('../models/RequestLog');

// Helper function to get client IP
function getClientIp(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Helper function to parse user agent
function parseUserAgent(userAgent) {
  if (!userAgent) return 'Unknown';
  
  // Simple parsing - in a real app you might use a library like 'ua-parser-js'
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return userAgent;
}

// API route to get request headers
router.get('/api/whoami', async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const language = req.headers['accept-language'] || 'Unknown';
    const software = parseUserAgent(req.headers['user-agent']);
    
    // Create response object
    const responseData = {
      ipaddress: clientIp,
      language: language.split(',')[0], // Get first language preference
      software: software
    };

    // Log the request to database
    const requestLog = new RequestLog({
      ipaddress: clientIp,
      language: responseData.language,
      software: responseData.software,
      headers: req.headers
    });

    await requestLog.save();

    // Send response
    res.json(responseData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all request logs (for testing/admin)
router.get('/api/requests', async (req, res) => {
  try {
    const requests = await RequestLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get request count
router.get('/api/stats', async (req, res) => {
  try {
    const totalRequests = await RequestLog.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRequests = await RequestLog.countDocuments({ 
      timestamp: { $gte: today } 
    });
    
    res.json({
      totalRequests,
      todayRequests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;