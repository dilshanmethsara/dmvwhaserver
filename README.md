# WhatsApp API Wrapper

A simple Express.js API wrapper for WireWeb's hosted WhatsApp service.

## Features

- Send WhatsApp messages via WireWeb API
- Simple REST API endpoint
- Input validation
- Error handling
- Ready for Vercel deployment

## API Endpoints

### POST /send-message

Send a WhatsApp message.

**Request Body:**
```json
{
  "to": "15551234567",
  "text": "Hello! 👋"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "3EB0F4D09DBDED9BBAC9DE",
    "status": "sent"
  }
}
```

## Environment Variables

Create a `.env` file:

```
WHATSAPP_API_BASE_URL=https://app.wireweb.co.in
WHATSAPP_API_KEY=your_api_key_here
WHATSAPP_SESSION_ID=your_session_id_here
PORT=3000
```

## Local Development

```bash
npm install
npm run dev
```

## Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## GitHub Repository

https://github.com/dilshanmethsara/dmvwhaserver.git
