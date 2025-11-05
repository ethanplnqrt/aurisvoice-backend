# AurisVoice Backend

## Overview
AurisVoice is a minimal, production-ready Node.js backend for a premium AI voice dubbing SaaS platform. Pure JavaScript, clean architecture, optimized for GitHub and Cursor IDE.

## Project Information
- **Type**: Backend API only (no frontend)
- **Framework**: Express.js
- **Language**: Pure JavaScript (no TypeScript)
- **Runtime**: Node.js 18+
- **Port**: 3000 (configurable via .env)

## Current State
Production-ready minimal backend with:
- Single `/status` endpoint with health check
- CORS middleware for cross-origin requests
- Environment variable management with dotenv
- Development auto-reload with nodemon
- Clean, flat file structure

## Architecture
```
aurisvoice-backend/
├── server.js             # Main Express application (root level)
├── .env.example          # Environment variable template
├── .gitignore            # Git exclusions
├── package.json          # Dependencies
├── package.minimal.json  # Clean template for export
└── README.md             # Documentation
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
The `.env.example` file contains placeholders for:
- `OPENAI_API_KEY` - For future OpenAI integration (transcript processing)
- `ELEVENLABS_API_KEY` - For future ElevenLabs integration (voice synthesis)
- `PORT` - Server port (defaults to 3000)

## Development Workflow
1. Copy `.env.example` to `.env` when ready to add API keys
2. Run `npm run dev` to start the development server with auto-reload
3. Server runs on `http://localhost:3000`
4. Test status endpoint at `http://localhost:3000/status`

## Production Deployment
Run `npm start` to start the server in production mode.

## Future Enhancements
Ready for expansion with:
- Voice dubbing API endpoints
- OpenAI integration for transcript processing
- ElevenLabs integration for voice synthesis
- Request validation and error handling middleware
- Rate limiting and API key authentication
- File upload handling for audio files
- Job queue for async processing
- Database integration for job tracking

## Dependencies

**Required (Minimal):**
- **express** (4.x) - Web framework
- **cors** (2.x) - CORS middleware  
- **dotenv** (16.x) - Environment variable management
- **nodemon** (3.x) - Development auto-reload (dev dependency)

**Note:** The current package.json contains additional dependencies from the original full-stack template. The actual running server only uses the 4 packages listed above. When exporting to GitHub or importing to Cursor, you can create a fresh package.json with only these minimal dependencies.

## Git Integration
This project is structured for easy:
- GitHub repository creation
- Cursor IDE import
- Version control with meaningful commits
- Collaboration and deployment

The `.gitignore` is configured to exclude `node_modules`, `.env`, logs, and system files.
