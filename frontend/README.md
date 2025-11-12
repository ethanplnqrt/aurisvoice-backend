# AurisVoice Frontend 🎙️

A modern, multilingual Next.js 14 frontend for the AurisVoice AI dubbing SaaS platform.

## ✨ Features

- 🌐 **Multilingual Support** - French 🇫🇷 (default), English 🇬🇧, Spanish 🇪🇸
- 🔄 **Auto Language Detection** - Automatically detects user's browser language
- 🎨 **Dark/Light Mode** - Seamless theme switching with persistent preference
- ⚡ **Fast & Modern** - Built with Next.js 14 and TailwindCSS
- 📱 **Fully Responsive** - Works perfectly on all devices
- 🎯 **SEO Optimized** - Complete meta tags and OpenGraph support
- 🎭 **Beautiful UI** - Elegant design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Backend server running (see backend README)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` to match your backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AurisVoice
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
```
http://localhost:3001
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Next.js pages
│   │   ├── _app.tsx        # App wrapper with theme provider
│   │   ├── _document.tsx   # HTML document with SEO meta tags
│   │   ├── index.tsx       # Landing page with upload
│   │   ├── dashboard/      # Dashboard page
│   │   └── about/          # About page
│   ├── components/         # Reusable React components
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── FileUpload.tsx
│   │   └── LanguageSelector.tsx
│   ├── lib/                # Utility functions and API client
│   │   ├── api.ts          # Backend API client
│   │   └── utils.ts        # Helper functions
│   ├── i18n/               # Internationalization
│   │   ├── translations.ts # All translations
│   │   └── useTranslation.ts # Translation hook
│   └── styles/             # Global styles
│       └── globals.css     # TailwindCSS styles
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🌍 Internationalization

The app supports 3 languages with auto-detection:

- **French (fr)** - Default language
- **English (en)** 
- **Spanish (es)**

### How it works:

1. **Auto-detection**: Browser language is detected on first visit
2. **Manual switch**: Users can switch languages via the navbar dropdown
3. **Persistence**: Language choice is saved across sessions

### Adding a new language:

1. Add translations in `src/i18n/translations.ts`
2. Update `next.config.js` locales array
3. Add language option in `src/components/LanguageSwitcher.tsx`

## 🎨 Theme System

Built-in dark/light mode with:
- System preference detection
- Manual toggle in navbar
- Persistent preference (localStorage)
- Smooth transitions

## 📡 API Integration

### Current Endpoints:

**Health Check:**
```typescript
import { checkStatus } from '@/lib/api';

const result = await checkStatus();
// Returns: { ok: true, data: { message: "AurisVoice backend is running 🚀" } }
```

**File Upload (Placeholder):**
```typescript
import { uploadFile } from '@/lib/api';

const result = await uploadFile(file, 'fr', 'en');
// Note: Backend endpoint not yet implemented
```

### Example API Call:

```typescript
// Test backend connection on page load
useEffect(() => {
  async function testBackend() {
    const result = await checkStatus();
    if (result.ok) {
      console.log('✅ Backend connected:', result.data);
    } else {
      console.error('❌ Backend error:', result.error);
    }
  }
  testBackend();
}, []);
```

## 🎯 Pages

### `/` - Home Page
- Hero section with brand messaging
- File upload zone (drag & drop)
- Source/target language selectors
- Generate dub button
- Audio playback preview

### `/dashboard` - Dashboard
- Project statistics
- Recent projects list
- Progress tracking
(Currently placeholder - ready for backend integration)

### `/about` - About Page
- Company information
- Features showcase
- Values and mission
- Call-to-action

## 🛠️ Development

### Available Scripts:

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Structure:

- **Pages**: Next.js file-based routing in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **Hooks**: Custom React hooks like `useTranslation()`
- **API Client**: Centralized in `src/lib/api.ts`
- **Styling**: TailwindCSS with custom theme

## 🎨 Styling

Built with **TailwindCSS** featuring:

- Custom color palette (primary/accent)
- Dark mode support
- Custom animations
- Responsive design utilities
- Gradient backgrounds

### Custom Colors:

```javascript
primary: { 50-900 } // Blue shades
accent: { 50-900 }  // Purple shades
```

## 🚀 Deployment

### Vercel (Recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms:

1. Build the project:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## 🔧 Configuration Files

### `next.config.js`
- i18n configuration
- Image optimization
- Performance settings

### `tailwind.config.js`
- Custom theme colors
- Animation keyframes
- Plugin configuration

### `.env.local`
- API URL
- App configuration
- Environment-specific settings

## 🌐 Environment Variables

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000

# App Config
NEXT_PUBLIC_APP_NAME=AurisVoice
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Note**: All public env vars must start with `NEXT_PUBLIC_`

## 📦 Dependencies

### Core:
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

### UI:
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library
- `framer-motion` - Animations
- `next-themes` - Theme management

### Utils:
- `clsx` - Class name utilities

## 🔗 Backend Integration

This frontend connects to the AurisVoice backend:

**Backend Repository**: https://github.com/ethanplnqrt/aurisvoice-backend

**Default Backend URL**: http://localhost:3000

### Testing Backend Connection:

1. Start the backend server (port 3000)
2. Start the frontend (port 3001)
3. Open browser console
4. Navigate to homepage
5. Check for connection logs

## 🎭 Features Demo

### File Upload:
- Drag & drop support
- File type validation (audio/video)
- Visual feedback
- File size display

### Language Selection:
- Dropdown with flags
- 8+ language options
- Visual selection state

### Audio Preview:
- HTML5 audio player
- Custom styled controls
- Responsive design

## 🐛 Troubleshooting

### Backend not connecting:
1. Check backend is running on port 3000
2. Verify `.env.local` has correct API URL
3. Check browser console for CORS errors

### Translations not working:
1. Clear browser cache
2. Check browser language settings
3. Manually switch language in navbar

### Build errors:
1. Delete `.next` folder
2. Delete `node_modules`
3. Run `npm install`
4. Run `npm run build`

## 📝 License

MIT License - See backend repository for details

## 👨‍💻 Author

Built with ❤️ for AurisVoice

## 🔮 Future Enhancements

- [ ] Real-time dubbing progress
- [ ] Audio waveform visualization
- [ ] Project history with search
- [ ] User authentication
- [ ] Payment integration
- [ ] Advanced audio controls
- [ ] Batch processing
- [ ] API key management

## 📞 Support

For issues or questions:
1. Check this README
2. Review backend documentation
3. Check console for errors
4. Contact development team

---

**Ready to transform audio with AI! 🎙️✨**

