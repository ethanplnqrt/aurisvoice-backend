# AurisVoice Backend

A minimal Node.js backend for a premium AI voice dubbing SaaS platform.

## Quick Start

The server is **already running** and ready to use! 

**Test it now:**
```bash
curl http://localhost:5000/status
```

**Response:**
```json
{
  "ok": true,
  "message": "AurisVoice backend is running"
}
```

## Features

✅ Express server running on port 5000 (3000 for local development)  
✅ CORS middleware for cross-origin requests  
✅ Environment variable configuration with dotenv  
✅ Development auto-reload with nodemon  
✅ Single `/status` health check endpoint  
✅ Clean project structure for GitHub/Cursor export  

## Core Files

The minimal backend consists of just these essential files:

```
server/
├── index.ts          # Main Express server (TypeScript)
└── index.js          # JavaScript version (for reference)
.env.example          # API key placeholders
.gitignore            # Git exclusions
README.md             # This file
```

## API Endpoints

### GET /status
Health check endpoint that confirms the backend is running.

**Response:**
```json
{
  "ok": true,
  "message": "AurisVoice backend is running"
}
```

## Environment Configuration

The `.env.example` file contains placeholders for future integrations:

```env
# OpenAI API Key (for transcript processing)
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key (for voice synthesis)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Server Configuration
PORT=3000
```

**To use:** Copy `.env.example` to `.env` and add your real API keys when ready.

## Running Locally (Outside Replit)

1. **Clone to your machine or Cursor IDE**
2. **Install minimal dependencies:**
   ```bash
   npm install express cors dotenv
   npm install -D nodemon
   ```
3. **Run the server:**
   ```bash
   # Development (with auto-reload)
   nodemon server/index.js
   
   # Production
   node server/index.js
   ```

## Export to GitHub

This project is optimized for version control:

1. `.gitignore` excludes `node_modules`, `.env`, and temporary files
2. Clean project structure with no bloat
3. All sensitive data in environment variables
4. Ready for `git init`, `git add .`, `git commit -m "Initial commit"`

## Import to Cursor

Simply clone this repository in Cursor IDE and start coding! The minimal structure ensures fast loading and no configuration overhead.

## Next Steps

Ready to extend with:
- 🎤 Voice dubbing API endpoints
- 🤖 OpenAI integration for transcript processing
- 🔊 ElevenLabs integration for voice synthesis
- ✅ Request validation middleware
- 🔒 API key authentication
- 📊 Rate limiting
- 📁 File upload handling for audio

## Current Status

✅ **Server Running:** http://localhost:5000/status  
✅ **Minimal Setup:** Core backend complete  
✅ **Ready for Export:** GitHub and Cursor ready  

## Note About Dependencies

The current `package.json` contains extra dependencies from the original template. When exporting to GitHub or Cursor, you can create a fresh `package.json` with only:

```json
{
  "name": "aurisvoice-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon server/index.js",
    "start": "node server/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

Then run `npm install` to get a clean `node_modules` with only what you need.
