require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    message: 'WhatsApp API Wrapper is running',
    endpoints: {
      'POST /send-message': 'Send a WhatsApp message',
      'GET /chats': 'Get chat list',
      'GET /groups': 'Get group chats with IDs and names'
    }
  });
});

// Get chat list endpoint
app.get('/chats', async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    
    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter. Must be between 1 and 100.'
      });
    }

    const apiUrl = `${process.env.WHATSAPP_API_BASE_URL}/api/v1/chats`;
    
    const response = await axios.get(apiUrl, {
      params: {
        sessionId: process.env.WHATSAPP_SESSION_ID,
        limit: limitNum
      },
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      }
    });

    // Return the external API response
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error getting chat list:', error.message);
    
    // Handle different types of errors
    if (error.response) {
      // The external API returned an error
      res.status(error.response.status).json({
        success: false,
        error: error.response.data || 'External API error',
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(500).json({
        success: false,
        error: 'Network error: Unable to reach external API'
      });
    } else {
      // Other error
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Get groups endpoint
app.get('/groups', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    
    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter. Must be between 1 and 100.'
      });
    }

    const apiUrl = `${process.env.WHATSAPP_API_BASE_URL}/api/v1/chats`;
    
    const response = await axios.get(apiUrl, {
      params: {
        sessionId: process.env.WHATSAPP_SESSION_ID,
        limit: limitNum
      },
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      }
    });

    // Filter only group chats and extract relevant information
    const groups = response.data.chats
      .filter(chat => chat.isGroup === true)
      .map(group => ({
        groupId: group.jid,
        name: group.name || 'Unnamed Group',
        phone: group.phone,
        pinned: group.pinned,
        archived: group.archived,
        mutedUntil: group.mutedUntil
      }));

    // Return the filtered group list
    res.json({
      success: true,
      data: {
        groups: groups,
        totalGroups: groups.length
      }
    });

  } catch (error) {
    console.error('Error getting groups:', error.message);
    
    // Handle different types of errors
    if (error.response) {
      // The external API returned an error
      res.status(error.response.status).json({
        success: false,
        error: error.response.data || 'External API error',
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(500).json({
        success: false,
        error: 'Network error: Unable to reach external API'
      });
    } else {
      // Other error
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Send message endpoint
app.post('/send-message', async (req, res) => {
  try {
    const { to, text } = req.body;

    // Validate required fields
    if (!to || !text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to and text are required'
      });
    }

    // Validate phone number or group ID format
    if (typeof to !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient format. Must be a string.'
      });
    }

    // Support both individual phone numbers (digits only) and group IDs (format: number@g.us)
    const isValidPhone = /^\d+$/.test(to);
    const isValidGroupId = /^\d+@g\.us$/.test(to);
    
    if (!isValidPhone && !isValidGroupId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient format. Use phone number (digits only) or group ID (format: 1234567890@g.us)'
      });
    }

    // Validate message
    if (typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message text cannot be empty'
      });
    }

    const apiUrl = `${process.env.WHATSAPP_API_BASE_URL}/api/v1/messages`;
    
    const response = await axios.post(apiUrl, {
      sessionId: process.env.WHATSAPP_SESSION_ID,
      to: to,
      text: text
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      }
    });

    // Return the external API response
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error sending message:', error.message);
    
    // Handle different types of errors
    if (error.response) {
      // The external API returned an error
      res.status(error.response.status).json({
        success: false,
        error: error.response.data || 'External API error',
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(500).json({
        success: false,
        error: 'Network error: Unable to reach external API'
      });
    } else {
      // Other error
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`WhatsApp API Wrapper server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}`);
  console.log(`Send message endpoint: POST http://localhost:${PORT}/send-message`);
});
