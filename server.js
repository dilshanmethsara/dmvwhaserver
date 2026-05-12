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
      'POST /send-message': 'Send a WhatsApp message'
    }
  });
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

    // Validate phone number format (basic validation)
    if (typeof to !== 'string' || !/^\d+$/.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Should contain only digits.'
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
