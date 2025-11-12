# AurisVoice Frontend - Complete Project Structure 📁

## Visual File Tree

```
aurisvoice-backend/
└── frontend/                           # Frontend application root
    ├── README.md                       # Main documentation
    ├── SETUP.md                        # Detailed setup guide
    ├── API_EXAMPLE.md                  # API integration examples
    ├── PROJECT_STRUCTURE.md            # This file
    │
    ├── package.json                    # Dependencies & scripts
    ├── package-lock.json               # Locked dependency versions
    ├── tsconfig.json                   # TypeScript configuration
    ├── next.config.js                  # Next.js configuration
    ├── tailwind.config.js              # TailwindCSS configuration
    ├── postcss.config.js               # PostCSS configuration
    ├── .eslintrc.json                  # ESLint rules
    ├── .gitignore                      # Git ignore rules
    ├── .env.example                    # Environment variables template
    ├── .env.local                      # Local environment (not in git)
    │
    ├── public/                         # Static assets
    │   └── favicon.ico                 # Site icon
    │
    └── src/                            # Source code
        │
        ├── pages/                      # Next.js pages (routing)
        │   ├── _app.tsx                # App wrapper with providers
        │   ├── _document.tsx           # HTML document with SEO
        │   ├── index.tsx               # Home page (/)
        │   ├── dashboard/
        │   │   └── index.tsx           # Dashboard page (/dashboard)
        │   └── about/
        │       └── index.tsx           # About page (/about)
        │
        ├── components/                 # Reusable React components
        │   ├── ThemeProvider.tsx       # Theme context provider
        │   ├── ThemeToggle.tsx         # Dark/light mode toggle
        │   ├── LanguageSwitcher.tsx    # Language dropdown
        │   ├── Navbar.tsx              # Top navigation bar
        │   ├── Footer.tsx              # Bottom footer
        │   ├── FileUpload.tsx          # Drag & drop file upload
        │   └── LanguageSelector.tsx    # Language selection dropdown
        │
        ├── lib/                        # Utility functions
        │   ├── api.ts                  # Backend API client
        │   └── utils.ts                # Helper functions
        │
        ├── i18n/                       # Internationalization
        │   ├── translations.ts         # All language translations
        │   └── useTranslation.ts       # Translation React hook
        │
        └── styles/                     # Global styles
            └── globals.css             # TailwindCSS + custom styles
```

---

## File Descriptions

### Configuration Files

#### `package.json`
- **Purpose**: Defines project dependencies and npm scripts
- **Key dependencies**: 
  - `next` - React framework
  - `react` - UI library
  - `tailwindcss` - CSS framework
  - `typescript` - Type safety
  - `next-themes` - Theme management
  - `lucide-react` - Icons
- **Scripts**:
  - `dev` - Start development server
  - `build` - Create production build
  - `start` - Start production server
  - `lint` - Run ESLint

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Key settings**:
  - `strict: true` - Strict type checking
  - Path aliases: `@/*` → `./src/*`
  - Target: ES5 for compatibility
  - JSX: preserve (Next.js handles it)

#### `next.config.js`
- **Purpose**: Next.js framework configuration
- **Features**:
  - i18n support (fr, en, es)
  - Locale detection
  - Image optimization
  - SWC minification
  - Security headers

#### `tailwind.config.js`
- **Purpose**: TailwindCSS customization
- **Custom features**:
  - Color palette (primary/accent)
  - Dark mode class strategy
  - Custom animations
  - Extended theme

#### `postcss.config.js`
- **Purpose**: CSS processing configuration
- **Plugins**: TailwindCSS + Autoprefixer

#### `.eslintrc.json`
- **Purpose**: Code quality rules
- **Extends**: Next.js core web vitals

#### `.gitignore`
- **Purpose**: Files to exclude from git
- **Excludes**: node_modules, .next, .env.local, etc.

#### `.env.example`
- **Purpose**: Environment variable template
- **Contains**: API_URL, APP_NAME, APP_URL

---

### Source Files

#### Pages (`src/pages/`)

##### `_app.tsx`
- **Purpose**: Root application wrapper
- **Features**:
  - Theme provider initialization
  - Layout structure (Navbar + Content + Footer)
  - Global providers
- **Renders on**: Every page

##### `_document.tsx`
- **Purpose**: Custom HTML document
- **Features**:
  - SEO meta tags
  - OpenGraph tags
  - Twitter Card tags
  - Font preconnects
- **Renders**: Once per page load

##### `index.tsx`
- **Route**: `/` (Home page)
- **Features**:
  - Hero section with branding
  - Feature highlights grid
  - File upload zone
  - Language selectors
  - Generate dub button
  - Audio preview
- **Components used**:
  - FileUpload
  - LanguageSelector
- **API calls**: uploadFile()

##### `dashboard/index.tsx`
- **Route**: `/dashboard`
- **Features**:
  - Project statistics
  - Recent projects list
  - Status indicators
- **Status**: Placeholder (ready for backend)

##### `about/index.tsx`
- **Route**: `/about`
- **Features**:
  - Company description
  - Features showcase
  - Values section
  - Call-to-action
- **Content**: Static/informational

---

#### Components (`src/components/`)

##### `ThemeProvider.tsx`
- **Purpose**: Wraps app with theme context
- **Uses**: next-themes library
- **Provides**: Theme state to all components

##### `ThemeToggle.tsx`
- **Purpose**: Toggle between light/dark mode
- **Location**: Navbar
- **Features**:
  - Sun/Moon icons
  - Smooth transitions
  - Persistent preference

##### `LanguageSwitcher.tsx`
- **Purpose**: Switch UI language
- **Location**: Navbar
- **Supports**: French, English, Spanish
- **Features**:
  - Flag emojis
  - Dropdown menu
  - Current language highlight

##### `Navbar.tsx`
- **Purpose**: Top navigation bar
- **Features**:
  - Logo with icon
  - Navigation links (Home, Dashboard, About)
  - Theme toggle
  - Language switcher
  - Sticky positioning
  - Backdrop blur effect

##### `Footer.tsx`
- **Purpose**: Bottom page footer
- **Features**:
  - Logo and tagline
  - Copyright notice
  - Responsive layout

##### `FileUpload.tsx`
- **Purpose**: File upload interface
- **Features**:
  - Drag and drop support
  - Click to browse
  - File type validation
  - Visual feedback
  - File info display (name, size)
  - Remove file option
- **Accepts**: audio/*, video/*

##### `LanguageSelector.tsx`
- **Purpose**: Select source/target language for dubbing
- **Features**:
  - Dropdown with flags
  - 8+ language options
  - Visual selection state
- **Used in**: Home page upload form

---

#### Library (`src/lib/`)

##### `api.ts`
- **Purpose**: Backend API client
- **Exports**:
  - `checkStatus()` - Health check
  - `uploadFile()` - Upload for dubbing
  - `handleApiError()` - Error handler
- **Features**:
  - Type-safe responses
  - Error handling
  - Environment-aware URLs

##### `utils.ts`
- **Purpose**: Helper utility functions
- **Exports**:
  - `cn()` - Class name merger
  - `formatFileSize()` - Human-readable sizes
  - `isValidMediaFile()` - File validation
  - `getBrowserLanguage()` - Detect language
- **Used by**: Components and pages

---

#### Internationalization (`src/i18n/`)

##### `translations.ts`
- **Purpose**: All UI text in 3 languages
- **Languages**: French (default), English, Spanish
- **Structure**: Nested object with translation keys
- **Exports**: 
  - `translations` - All translations
  - `Locale` - Language type
  - `TranslationKey` - Translation key type

##### `useTranslation.ts`
- **Purpose**: React hook for translations
- **Exports**:
  - `useTranslation()` - Hook with t() function
  - `getStaticTranslation()` - For server-side
- **Features**:
  - Current locale detection
  - Translation function `t(key)`
  - Locale change function
  - Fallback to French

---

#### Styles (`src/styles/`)

##### `globals.css`
- **Purpose**: Global CSS and Tailwind imports
- **Includes**:
  - Tailwind base, components, utilities
  - Custom CSS variables
  - Dark mode variables
  - Custom animations
- **Features**:
  - Gradient animation
  - Dark mode support
  - Custom utilities

---

### Public Assets (`public/`)

##### `favicon.ico`
- **Purpose**: Browser tab icon
- **Format**: ICO file
- **Size**: 16x16, 32x32 (standard)

*Additional assets to add:*
- `logo.png` - High-res logo
- `og-image.png` - OpenGraph preview image
- `robots.txt` - SEO crawler rules
- `sitemap.xml` - Site structure

---

## Component Hierarchy

```
App (_app.tsx)
├── ThemeProvider
│   ├── Navbar
│   │   ├── ThemeToggle
│   │   └── LanguageSwitcher
│   │
│   ├── Page Content (varies by route)
│   │   │
│   │   ├── Home (/)
│   │   │   ├── FileUpload
│   │   │   └── LanguageSelector (x2)
│   │   │
│   │   ├── Dashboard (/dashboard)
│   │   │   └── [Stats & Project List]
│   │   │
│   │   └── About (/about)
│   │       └── [Static Content]
│   │
│   └── Footer
```

---

## Data Flow

### Translation Flow
```
Browser Language → useTranslation() → translations.ts → UI Text
User Selection → changeLocale() → Router → Page Re-render
```

### Theme Flow
```
System Preference → ThemeProvider → next-themes → CSS Classes
User Toggle → ThemeToggle → setTheme() → localStorage → Persist
```

### API Flow
```
User Action → Component → lib/api.ts → Backend → Response
Backend Data → Component State → UI Update
```

### File Upload Flow
```
User Drop/Select → FileUpload → Validation → Preview
Generate Click → uploadFile() → Backend → Audio Preview
```

---

## Routing Structure

| URL | File | Purpose |
|-----|------|---------|
| `/` | `pages/index.tsx` | Landing & upload |
| `/dashboard` | `pages/dashboard/index.tsx` | Project management |
| `/about` | `pages/about/index.tsx` | Company info |
| `/[locale]/...` | Auto-generated | Localized routes |

**Note**: Next.js automatically handles locale prefixes (e.g., `/fr`, `/en`, `/es`)

---

## Styling Architecture

### Tailwind Classes
- **Utilities**: Direct in JSX (e.g., `className="flex gap-4"`)
- **Responsive**: Breakpoints (sm:, md:, lg:, xl:)
- **Dark Mode**: `dark:` prefix
- **Custom**: Defined in `tailwind.config.js`

### Custom Animations
- `animate-fade-in` - Fade in on mount
- `animate-slide-up` - Slide up from bottom
- `animate-pulse-slow` - Slow pulse effect
- `animate-gradient` - Animated gradient bg

### Color Scheme
```css
Primary (Blue):
  50, 100, 200, ..., 900

Accent (Purple):
  50, 100, 200, ..., 900

Gradients:
  from-primary-600 to-accent-600
```

---

## Type Safety

### TypeScript Usage
- All files use `.tsx` (React) or `.ts`
- Strict mode enabled
- Path aliases for imports
- Type-safe API responses
- Typed translation keys

### Common Types
```typescript
Locale: 'fr' | 'en' | 'es'
TranslationKey: keyof translations.fr
ApiResponse<T>: { ok: boolean, data?: T, error?: string }
```

---

## Performance Optimizations

1. **Code Splitting**: Automatic per route
2. **Image Optimization**: Next.js Image component
3. **Font Loading**: Preconnect to CDNs
4. **CSS Purging**: Tailwind removes unused styles
5. **Minification**: SWC compiler
6. **Caching**: Static generation where possible
7. **Lazy Loading**: Dynamic imports for heavy components

---

## Security Features

1. **No powered-by header**: Hidden in config
2. **CORS**: Handled by backend
3. **Environment variables**: NEXT_PUBLIC_ prefix for client
4. **XSS Protection**: React auto-escaping
5. **Content Security**: Meta tags in _document

---

## Development Workflow

1. **Start backend**: `cd .. && npm run dev`
2. **Start frontend**: `npm run dev`
3. **Edit code**: Files auto-reload
4. **View changes**: Browser auto-refreshes
5. **Check console**: Errors & logs
6. **Test features**: Manual QA
7. **Build**: `npm run build`
8. **Deploy**: Push to hosting

---

## Build Output Structure

After `npm run build`:

```
.next/                          # Build output
├── cache/                      # Build cache
├── server/                     # Server-side code
│   └── pages/                  # Pre-rendered pages
├── static/                     # Static assets
│   ├── chunks/                 # JS bundles
│   ├── css/                    # Compiled CSS
│   └── media/                  # Optimized images
└── BUILD_ID                    # Unique build identifier
```

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Total Files** | ~25 source files |
| **Pages** | 3 (/, /dashboard, /about) |
| **Components** | 7 reusable |
| **Languages** | 3 (fr, en, es) |
| **Bundle Size** | ~85-90 KB (First Load) |
| **Build Time** | ~10-30 seconds |
| **Lighthouse Score** | 90+ (target) |

---

## Dependencies Summary

### Production
- `next@14.2.18` - Framework
- `react@18.3.1` - UI library
- `next-themes@0.4.6` - Theme system
- `lucide-react@0.453.0` - Icons
- `framer-motion@11.13.1` - Animations
- `clsx@2.1.1` - Class utilities

### Development
- `typescript@5.6.3` - Types
- `tailwindcss@3.4.17` - Styling
- `eslint@8.57.0` - Linting
- `@types/*` - Type definitions

---

## Future Expansion Points

### Easy to Add:
- [ ] More pages (pricing, contact, etc.)
- [ ] More languages
- [ ] User authentication
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Real-time updates (WebSocket)
- [ ] Progress tracking
- [ ] Download history
- [ ] User profiles
- [ ] Team collaboration

### Components Ready:
- Modal system
- Toast notifications
- Loading spinners
- Error boundaries
- Form validation
- Data tables
- Charts/graphs

---

## Quick Reference

### Import Paths
```typescript
// Pages
import Component from '@/components/Component'

// Lib
import { api } from '@/lib/api'
import { utils } from '@/lib/utils'

// i18n
import { useTranslation } from '@/i18n/useTranslation'

// Styles
import '@/styles/globals.css'
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL          # Backend URL
NEXT_PUBLIC_APP_NAME         # App name
NEXT_PUBLIC_APP_URL          # Frontend URL
```

### npm Scripts
```bash
npm run dev      # Development
npm run build    # Production build
npm start        # Production server
npm run lint     # Code linting
```

---

**Project structure designed for scalability and maintainability! 🚀**

