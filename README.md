# AurisVoice Backend 🎙️

A minimal, production-ready Node.js backend for a premium AI voice dubbing SaaS platform.

## Quick Start

**1. Install dependencies:**
```bash
npm install
```

**2. Start the server:**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

**3. Test the endpoint:**
```bash
curl http://localhost:3000/status
```

**Response:**
```json
{
  "ok": true,
  "message": "AurisVoice backend is running 🚀"
}
```

## Features

✅ **Pure JavaScript** - No TypeScript complexity  
✅ **Minimal dependencies** - Only Express, CORS, and Dotenv  
✅ **Production-ready** - Clean, organized, and tested  
✅ **Auto-reload** - Nodemon for fast development  
✅ **Environment config** - Secure API key management  
✅ **Export-ready** - Optimized for GitHub and Cursor  

## Project Structure

```
aurisvoice-backend/
├── server.js           # Main Express application
├── .env.example        # Environment variable template
├── .gitignore          # Git exclusions
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## API Endpoints

### GET /status
Health check endpoint that confirms the backend is running.

**Response:**
```json
{
  "ok": true,
  "message": "AurisVoice backend is running 🚀"
}
```

## Environment Configuration

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Then edit `.env` with your real API keys:

```env
# OpenAI API Key (for transcript processing)
OPENAI_API_KEY=sk-your-actual-openai-key-here

# ElevenLabs API Key (for voice synthesis)
ELEVENLABS_API_KEY=your-actual-elevenlabs-key-here

# Server Configuration
PORT=3000
```

## Development

```bash
# Install dependencies
npm install

# Start with auto-reload
npm run dev

# The server will automatically restart when you edit files
```

## Production

```bash
# Start without auto-reload
npm start
```

## Testing

```bash
# Test the status endpoint
curl http://localhost:3000/status

# Expected response:
# {"ok":true,"message":"AurisVoice backend is running 🚀"}
```

## Export to GitHub

Ready for version control:

```bash
git init
git add .
git commit -m "Initial commit: AurisVoice minimal backend"
git remote add origin your-repo-url
git push -u origin main
```

## Import to Cursor

1. Clone the repository in Cursor IDE
2. Run `npm install`
3. Start coding!

## Dependencies

**Production:**
- `express` - Fast, unopinionated web framework
- `cors` - Enable CORS with various options
- `dotenv` - Load environment variables from .env

**Development:**
- `nodemon` - Auto-restart on file changes

## Next Steps

Ready to extend with:
- 🎤 Voice dubbing API endpoints
- 🤖 OpenAI integration for transcript processing
- 🔊 ElevenLabs integration for voice synthesis
- ✅ Request validation middleware
- 🔒 API key authentication
- 📊 Rate limiting

## Clean Package.json

For a fresh start when exporting, use `package.minimal.json`:

```bash
# Replace package.json with the minimal version
cp package.minimal.json package.json
npm install
```

This removes all unnecessary dependencies and keeps only what you need.
