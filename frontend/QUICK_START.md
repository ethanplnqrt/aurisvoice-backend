# 🚀 AurisVoice Frontend - Quick Start Guide

Get up and running in **5 minutes**!

---

## ⚡ Fastest Setup (Copy & Paste)

### 1️⃣ Install & Configure (1 command)

```bash
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend/frontend && npm install && cp .env.example .env.local && echo "✅ Setup complete!"
```

### 2️⃣ Start Development Server

```bash
npm run dev
```

### 3️⃣ Open Browser

```
http://localhost:3001
```

**Done! 🎉**

---

## 📋 Step-by-Step (Beginners)

### Step 1: Navigate to Frontend Directory

```bash
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Wait for**: "added XXX packages" message

### Step 3: Create Environment File

```bash
cp .env.example .env.local
```

This creates your local configuration file.

### Step 4: Start the App

```bash
npm run dev
```

**You should see:**
```
✓ Ready in 2.3s
○ Local: http://localhost:3001
```

### Step 5: Open Your Browser

Navigate to: **http://localhost:3001**

You should see the beautiful AurisVoice landing page! 🎙️

---

## 🔗 With Backend Running

### Terminal 1 - Backend

```bash
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend
npm run dev
```

**Runs on**: http://localhost:3000

### Terminal 2 - Frontend

```bash
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend/frontend
npm run dev
```

**Runs on**: http://localhost:3001

### Test Connection

Open **http://localhost:3001** and check browser console (F12):
- Should see: `✅ Backend connected`
- Backend status should show green 🟢

---

## ✅ Verification Checklist

After starting, verify these work:

- [ ] Page loads at http://localhost:3001
- [ ] Hero section displays "AurisVoice"
- [ ] Language switcher in navbar (🇫🇷 🇬🇧 🇪🇸)
- [ ] Theme toggle works (☀️ / 🌙)
- [ ] File upload zone is visible
- [ ] Navigation links work (Home, Dashboard, About)
- [ ] No errors in browser console (F12)

---

## 🎨 Try These Features

### 1. Upload a File
- Drag & drop an audio/video file
- Or click "Select a File"
- See file info display

### 2. Switch Languages
- Click globe icon 🌐 in navbar
- Try: French 🇫🇷, English 🇬🇧, Spanish 🇪🇸
- Watch text update instantly

### 3. Toggle Theme
- Click sun ☀️ or moon 🌙 icon
- See dark/light mode switch
- Preference saves automatically

### 4. Navigate Pages
- Click "Dashboard" → See project stats
- Click "About" → Company info
- Click "Home" → Back to upload

---

## 🐛 Common Issues & Fixes

### Issue: "Port 3001 already in use"

**Fix:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Then start again
npm run dev
```

### Issue: "Cannot find module 'next'"

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Backend not connecting"

**Fix:**
1. Make sure backend is running on port 3000
2. Check `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:3000`
3. Restart both servers

### Issue: Build errors

**Fix:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev
```

---

## 📱 Access on Mobile (Same Network)

1. Find your computer's IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. Open on mobile browser:
```
http://[YOUR_IP]:3001
```

Example: `http://192.168.1.10:3001`

---

## 🎯 What to Test First

### 1. Language Auto-Detection
- Open in different browsers
- Change browser language settings
- App should auto-select language

### 2. Upload Interface
- Drag and drop a file
- Try invalid file type (should reject)
- Try valid audio/video file (should accept)

### 3. Dark Mode
- Toggle theme
- Refresh page
- Theme should persist

### 4. Responsive Design
- Resize browser window
- Try mobile view (⌘+Option+M in Chrome)
- All features should work

---

## 📊 Performance Check

### Browser Console (F12)

**No errors**: ✅ Good  
**Yellow warnings**: ⚠️ OK  
**Red errors**: ❌ Need fixing

### Page Load Time

**Expected**: 1-3 seconds on first load  
**Subsequent**: < 1 second (cached)

### Network Tab

Check backend API call:
- `GET http://localhost:3000/status`
- Status: 200 OK
- Response: `{ ok: true, message: "..." }`

---

## 🚀 Next Steps

### Customize
- Edit colors in `tailwind.config.js`
- Add translations in `src/i18n/translations.ts`
- Add pages in `src/pages/`

### Integrate Backend
- Implement real dubbing endpoint
- Add authentication
- Connect to database

### Deploy
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update environment variables

---

## 📖 More Documentation

- **Detailed Setup**: See `SETUP.md`
- **API Examples**: See `API_EXAMPLE.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`
- **Main README**: See `README.md`

---

## 🆘 Need Help?

### Checklist Before Asking
1. ✅ Node.js 18+ installed?
2. ✅ Backend running on port 3000?
3. ✅ `.env.local` file exists?
4. ✅ No errors in `npm install`?
5. ✅ Browser console checked?

### Logs to Share
```bash
# Version check
node --version
npm --version

# Error logs
npm run dev 2>&1 | tee debug.log
```

---

## 💡 Pro Tips

### Speed Up Development
```bash
# Use fast refresh - changes appear instantly
# Just save files, no restart needed!
```

### VS Code Extensions
- ESLint
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### Keyboard Shortcuts
- `Ctrl + C` - Stop server
- `Cmd + R` - Refresh browser
- `Cmd + Shift + R` - Hard refresh
- `Cmd + Option + I` - Open DevTools

---

## 🎉 Success!

If you can see the AurisVoice page at **http://localhost:3001**, you're all set!

**Enjoy building with AurisVoice! 🎙️✨**

---

## Quick Command Reference

```bash
# Install
npm install

# Development
npm run dev

# Production Build
npm run build
npm start

# Linting
npm run lint

# Clean Install
rm -rf node_modules .next && npm install
```

---

**Total Setup Time**: ⏱️ 5 minutes  
**Difficulty Level**: 🟢 Beginner Friendly

**Let's create amazing voice dubs! 🚀**

