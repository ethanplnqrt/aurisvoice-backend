# AurisVoice Frontend - Complete Setup Guide 🚀

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Replit Setup](#replit-setup)
3. [Backend Integration](#backend-integration)
4. [Environment Configuration](#environment-configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **Git** (for cloning)

### Step-by-Step Installation

#### 1. Clone or Navigate to Project
```bash
cd /path/to/aurisvoice-backend/frontend
```

#### 2. Install Dependencies
```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TailwindCSS
- TypeScript
- Theme management (next-themes)
- Icons (lucide-react)
- Utilities (clsx, framer-motion)

**Expected install time**: 1-3 minutes

#### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit with your settings
nano .env.local  # or use any text editor
```

**Required variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AurisVoice
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### 4. Start Development Server
```bash
npm run dev
```

**Output should show:**
```
> aurisvoice-frontend@1.0.0 dev
> next dev

ready - started server on 0.0.0.0:3000, url: http://localhost:3001
event - compiled client and server successfully
```

#### 5. Open in Browser
Navigate to: **http://localhost:3001**

You should see the AurisVoice landing page! 🎉

---

## Replit Setup

### Method 1: Import from GitHub

1. **Fork the backend repository** on GitHub
2. **Import to Replit**:
   - Go to https://replit.com
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Enter repository URL
   
3. **Navigate to frontend**:
```bash
cd frontend
npm install
```

4. **Configure Replit**:

Create `.replit` file in frontend directory:
```toml
run = "npm run dev"
entrypoint = "src/pages/index.tsx"

[env]
NEXT_PUBLIC_API_URL = "http://localhost:3000"
NEXT_PUBLIC_APP_URL = "https://[your-repl-name].[your-username].repl.co"
```

5. **Start the application**:
- Click "Run" button
- Replit will automatically open the webview

### Method 2: Manual Setup in Replit

1. **Create new Node.js Repl**
2. **Upload frontend files** or clone repository
3. **Install dependencies**:
```bash
npm install
```

4. **Configure environment**:
- Use Replit Secrets for environment variables
- Add `NEXT_PUBLIC_API_URL` secret

5. **Run**:
```bash
npm run dev
```

---

## Backend Integration

### Connecting to Local Backend

1. **Start the backend server** (in separate terminal):
```bash
cd ../  # Go to backend root
npm run dev
```

Backend should run on: **http://localhost:3000**

2. **Verify backend is running**:
```bash
curl http://localhost:3000/status
```

Expected response:
```json
{
  "ok": true,
  "message": "AurisVoice backend is running 🚀"
}
```

3. **Frontend will automatically connect** using `.env.local` settings

### Testing Backend Connection

Open browser console (F12) and check for:
```
✅ Backend connected: {message: "AurisVoice backend is running 🚀"}
```

If you see this, integration is working! ✨

---

## Environment Configuration

### Development Environment

**File**: `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AurisVoice
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Production Environment

**File**: `.env.production`
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_APP_NAME=AurisVoice
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

### Environment Variable Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `AurisVoice` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3001` |

**⚠️ Important**: All variables must start with `NEXT_PUBLIC_` to be accessible in the browser!

---

## Testing

### Manual Testing Checklist

#### 1. Homepage Test
- [ ] Page loads without errors
- [ ] Hero section displays
- [ ] Upload zone is visible
- [ ] Language selectors work

#### 2. Upload Test
- [ ] Drag & drop works
- [ ] File button works
- [ ] File validation works (try invalid file)
- [ ] Selected file displays

#### 3. Language Test
- [ ] Navbar language switcher works
- [ ] French 🇫🇷 option works
- [ ] English 🇬🇧 option works
- [ ] Spanish 🇪🇸 option works
- [ ] All text updates

#### 4. Theme Test
- [ ] Theme toggle in navbar
- [ ] Switch to dark mode
- [ ] Switch to light mode
- [ ] Theme persists on refresh

#### 5. Navigation Test
- [ ] Click "Home" in navbar
- [ ] Click "Dashboard" in navbar
- [ ] Click "About" in navbar
- [ ] All pages load correctly

#### 6. Responsive Test
- [ ] Desktop view (>1024px)
- [ ] Tablet view (768-1024px)
- [ ] Mobile view (<768px)

### API Testing

**Test Backend Connection:**

Open browser console and run:
```javascript
fetch('http://localhost:3000/status')
  .then(r => r.json())
  .then(d => console.log('✅ Backend:', d))
  .catch(e => console.error('❌ Error:', e));
```

**Expected Output:**
```javascript
✅ Backend: {ok: true, message: "AurisVoice backend is running 🚀"}
```

---

## Troubleshooting

### Issue: "Cannot find module 'next'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3001 is already in use"

**Solution:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Issue: "Backend not connecting"

**Check:**
1. Backend is running on port 3000
2. `.env.local` has correct API URL
3. No CORS errors in console

**Solution:**
```bash
# Restart backend
cd ..
npm run dev

# Restart frontend
cd frontend
npm run dev
```

### Issue: "Translations not loading"

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: "CSS not loading / Tailwind not working"

**Solution:**
```bash
# Rebuild Tailwind
npm run dev
# Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
```

### Issue: "Type errors in TypeScript"

**Solution:**
```bash
# Check TypeScript
npx tsc --noEmit

# If needed, regenerate types
rm -rf .next
npm run dev
```

---

## Port Configuration

### Default Ports
- **Frontend**: 3001
- **Backend**: 3000

### Changing Ports

**Frontend:**
```bash
PORT=3002 npm run dev
```

Or in `package.json`:
```json
"scripts": {
  "dev": "PORT=3001 next dev"
}
```

**Update `.env.local`** to match new ports!

---

## Production Build

### Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

**Expected output:**
```
> aurisvoice-frontend@1.0.0 build
> next build

info  - Creating an optimized production build
info  - Compiled successfully
info  - Collecting page data
info  - Generating static pages
info  - Finalizing page optimization

Route (pages)                              Size     First Load JS
┌ ○ /                                      5.2 kB          89 kB
├ ○ /about                                 3.1 kB          87 kB
└ ○ /dashboard                             2.8 kB          86 kB
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend URL updated to production
- [ ] Build runs without errors
- [ ] All pages accessible
- [ ] API connection works
- [ ] SEO meta tags verified
- [ ] Dark/light mode works
- [ ] i18n works in all languages
- [ ] Mobile responsive
- [ ] No console errors

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Run linter
npm run lint

# Clear cache
rm -rf .next node_modules package-lock.json && npm install
```

---

## File Structure Quick Reference

```
frontend/
├── src/
│   ├── pages/          # Routes: /, /dashboard, /about
│   ├── components/     # UI components
│   ├── lib/            # API client & utilities
│   ├── i18n/           # Translations
│   └── styles/         # Global CSS
├── public/             # Static assets
├── .env.local          # Local environment
├── next.config.js      # Next.js config
└── package.json        # Dependencies
```

---

## Success Indicators

✅ **Setup is complete when:**
1. `npm run dev` starts without errors
2. Browser opens to http://localhost:3001
3. Page displays AurisVoice branding
4. Backend connection log in console
5. Language switcher works
6. Theme toggle works
7. All pages navigate correctly

---

## Next Steps

1. ✅ Complete setup using this guide
2. 🧪 Test all features manually
3. 🔗 Ensure backend is connected
4. 🎨 Customize styling if needed
5. 🚀 Deploy to production
6. 📊 Monitor performance

---

## Support & Resources

- **Documentation**: See README.md
- **Backend Docs**: ../README.md
- **Next.js Docs**: https://nextjs.org/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Happy coding! 🎙️✨**

