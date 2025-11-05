# AurisVoice Backend

## Overview
AurisVoice is a minimal Node.js backend API for a premium AI voice dubbing SaaS platform. This is a clean, lightweight Express server optimized for GitHub integration and import into Cursor IDE.

## Project Information
- **Type**: Backend API only (no frontend)
- **Framework**: Express.js
- **Runtime**: Node.js
- **Port**: 3000

## Current State
The backend is a minimal Express server with:
- Single `/status` endpoint that returns server health status
- CORS middleware for cross-origin requests
- Environment variable support via dotenv
- Development auto-reload with nodemon

## Architecture
```
server/
  └── index.js        # Main Express application
.env.example          # Environment variable template
README.md             # Project documentation
package.json          # Dependencies (express, cors, dotenv, nodemon)
```

## API Endpoints

### GET /status
Returns the current status of the AurisVoice backend.

**Response:**
```json
{
  "ok": true,
  "message": "AurisVoice backend is running"
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
