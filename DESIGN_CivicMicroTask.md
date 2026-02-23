# Design System & UX Guide
# CivicPulse — Civic Micro-Task Platform

**Version:** 1.0  
**Target:** Hackathon MVP  
**Framework:** Next.js 14 + Tailwind CSS  
**Philosophy:** Civic trust through clean design. Government-grade seriousness with consumer-grade ease.

---

## 1. Design Principles

### 1.1 Core Philosophy
This app serves citizens AND authorities. The design must feel:
- **Trustworthy** — not playful or startup-y. Think Google Maps meets a government portal done right.
- **Fast** — every interaction should feel instant. No unnecessary animations blocking flows.
- **Accessible** — works in bright sunlight (outdoor use), works on cheap Android phones, works for all ages.
- **Action-oriented** — every screen should have one clear primary action.

### 1.2 Design Rules
1. **No decorative elements.** Every pixel serves a function.
2. **High contrast always.** Users will use this outdoors, in bright light.
3. **Left-aligned text.** Never center-align body text.
4. **Touch targets ≥ 44px.** Non-negotiable for mobile.
5. **Max content width: 1280px.** Center on large screens with `mx-auto`.
6. **Map is the hero.** On dashboard, the map gets the most screen real estate.

---

## 2. Color System

### 2.1 Primary Palette

```css
/* Tailwind config — extend colors */
colors: {
  brand: {
    50:  '#EFF6FF',   /* Lightest blue — backgrounds */
    100: '#DBEAFE',   /* Light blue — hover states */
    200: '#BFDBFE',   /* Blue tint — secondary backgrounds */
    300: '#93C5FD',   /* Medium blue — borders */
    400: '#60A5FA',   /* Blue — secondary actions */
    500: '#3B82F6',   /* Primary blue — main CTAs, links */
    600: '#2563EB',   /* Dark blue — hover on primary */
    700: '#1D4ED8',   /* Darker blue — active states */
    800: '#1E3A5F',   /* Navy — headings, admin sidebar */
    900: '#0F172A',   /* Near-black — body text */
  }
}
```

### 2.2 Semantic Colors

| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| `status-submitted` | `bg-amber-100 text-amber-800` | `#FEF3C7` / `#92400E` | Submitted status badge |
| `status-review` | `bg-blue-100 text-blue-800` | `#DBEAFE` / `#1E40AF` | Under review badge |
| `status-progress` | `bg-purple-100 text-purple-800` | `#F3E8FF` / `#6B21A8` | In progress badge |
| `status-resolved` | `bg-green-100 text-green-800` | `#DCFCE7` / `#166534` | Resolved badge |
| `status-rejected` | `bg-red-100 text-red-800` | `#FEE2E2` / `#991B1B` | Rejected badge |
| `priority-low` | `text-slate-500` | `#64748B` | Low priority |
| `priority-medium` | `text-amber-500` | `#F59E0B` | Medium priority |
| `priority-high` | `text-orange-500` | `#F97316` | High priority |
| `priority-critical` | `text-red-600` | `#DC2626` | Critical priority |
| `xp-gold` | `text-amber-500` | `#F59E0B` | XP value display |
| `success` | `bg-green-50 text-green-700` | `#F0FDF4` / `#15803D` | Success toasts |
| `error` | `bg-red-50 text-red-700` | `#FEF2F2` / `#B91C1C` | Error toasts |
| `surface` | `bg-white` | `#FFFFFF` | Cards, panels |
| `surface-alt` | `bg-slate-50` | `#F8FAFC` | Page backgrounds |
| `border` | `border-slate-200` | `#E2E8F0` | Card borders, dividers |

### 2.3 Category Colors (for map markers and category badges)

| Category | Color | Tailwind | Map Marker |
|----------|-------|----------|------------|
| Road Damage | Red | `bg-red-500` | Red pin |
| Streetlight | Amber | `bg-amber-500` | Amber pin |
| Sanitation | Green | `bg-green-600` | Green pin |
| Public Property | Blue | `bg-blue-500` | Blue pin |
| Water Supply | Cyan | `bg-cyan-500` | Cyan pin |
| Safety Hazard | Red-orange | `bg-orange-600` | Orange pin |
| Public Notice | Purple | `bg-purple-500` | Purple pin |
| Greenery | Emerald | `bg-emerald-500` | Emerald pin |
| Other | Slate | `bg-slate-400` | Gray pin |

---

## 3. Typography

### 3.1 Font Stack

```css
/* In tailwind.config.ts */
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

**Load Inter from Google Fonts in `app/layout.tsx`:**
```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
// Apply: <body className={inter.className}>
```

### 3.2 Type Scale

| Element | Class | Size | Weight | Color | Usage |
|---------|-------|------|--------|-------|-------|
| Page Title | `text-2xl md:text-3xl font-bold` | 24/30px | 700 | `text-slate-900` | Page headings |
| Section Title | `text-xl font-semibold` | 20px | 600 | `text-slate-800` | Section headings |
| Card Title | `text-lg font-semibold` | 18px | 600 | `text-slate-800` | Card headings |
| Body | `text-base` | 16px | 400 | `text-slate-700` | Default body text |
| Body Small | `text-sm` | 14px | 400 | `text-slate-600` | Secondary text |
| Caption | `text-xs` | 12px | 500 | `text-slate-500` | Timestamps, labels |
| Stat Number | `text-3xl font-bold` | 30px | 700 | `text-slate-900` | Dashboard stat values |
| XP Value | `text-xl font-bold` | 20px | 700 | `text-amber-500` | XP display |

### 3.3 Typography Rules
- **Never use more than 2 font weights on a single screen** (regular + bold/semibold)
- **Line height:** `leading-relaxed` (1.625) for body text, `leading-tight` (1.25) for headings
- **Max line width:** `max-w-prose` (65ch) for any paragraph text
- **No all-caps** except for tiny labels and status badges

---

## 4. Spacing & Layout

### 4.1 Spacing Scale
Use Tailwind's default spacing scale consistently:
- `p-4` (16px) — standard card padding
- `p-6` (24px) — large card padding on desktop
- `gap-4` (16px) — between cards in a grid
- `gap-6` (24px) — between sections
- `space-y-2` (8px) — between form fields
- `mb-8` (32px) — between major page sections

### 4.2 Grid System

```tsx
/* Dashboard layout — desktop */
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">  {/* Map — takes 2/3 */}
    <ComplaintMap />
  </div>
  <div className="lg:col-span-1">  {/* Sidebar — stats + feed */}
    <StatsCards />
    <RecentActivity />
  </div>
</div>

/* Stats cards — responsive grid */
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### 4.3 Page Layout Template

```tsx
/* Standard page layout */
<main className="min-h-screen bg-slate-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {/* Page header */}
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Page Title</h1>
      <p className="mt-1 text-sm text-slate-600">Page description</p>
    </div>
    {/* Page content */}
    {children}
  </div>
</main>
```

---

## 5. Component Specifications

### 5.1 Cards

**Standard Card:**
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="p-4 md:p-6">
    {/* content */}
  </div>
</div>
```

**Stat Card:**
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-brand-50">
      <Icon className="w-5 h-5 text-brand-500" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Label</p>
      <p className="text-2xl font-bold text-slate-900">42</p>
    </div>
  </div>
</div>
```

**Complaint Card (in feed/list):**
```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
  <div className="flex gap-4 p-4">
    {/* Thumbnail */}
    <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
      <img className="w-full h-full object-cover" />
    </div>
    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <CategoryBadge />
        <StatusBadge />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 truncate">Complaint title</h3>
      <p className="text-xs text-slate-500 mt-1">Koramangala, Bangalore • 2 hours ago</p>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <HeartIcon className="w-3 h-3" /> 12 upvotes
        </span>
      </div>
    </div>
  </div>
</div>
```

### 5.2 Badges

**Status Badge:**
```tsx
const STATUS_STYLES = {
  submitted:    'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  in_progress:  'bg-purple-100 text-purple-800',
  resolved:     'bg-green-100 text-green-800',
  rejected:     'bg-red-100 text-red-800',
};

<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
  {statusLabel}
</span>
```

**Category Badge:**
```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
  <CategoryIcon className="w-3 h-3" />
  {categoryLabel}
</span>
```

**XP Badge (in navbar):**
```tsx
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
  <ZapIcon className="w-3.5 h-3.5 text-amber-500" />
  <span className="text-xs font-bold text-amber-700">350 XP</span>
</div>
```

**Level Badge:**
```tsx
const LEVEL_COLORS = {
  1: 'bg-slate-100 text-slate-700 border-slate-300',
  2: 'bg-green-100 text-green-700 border-green-300',
  3: 'bg-blue-100 text-blue-700 border-blue-300',
  4: 'bg-purple-100 text-purple-700 border-purple-300',
  5: 'bg-orange-100 text-orange-700 border-orange-300',
  6: 'bg-red-100 text-red-700 border-red-300',
  7: 'bg-amber-100 text-amber-700 border-amber-300',
};

<div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${LEVEL_COLORS[level]}`}>
  <ShieldIcon className="w-3 h-3" />
  Lv.{level} {levelTitle}
</div>
```

### 5.3 Buttons

**Primary Button:**
```tsx
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
  Submit Report
</button>
```

**Secondary Button:**
```tsx
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 transition-colors">
  Cancel
</button>
```

**Ghost Button:**
```tsx
<button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50 font-medium rounded-lg transition-colors">
  View All
</button>
```

**Icon Button (upvote, etc.):**
```tsx
<button className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors">
  <HeartIcon className="w-5 h-5 text-slate-400" />
</button>
// Active state:
<button className="p-2 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
  <HeartIcon className="w-5 h-5 text-red-500 fill-red-500" />
</button>
```

### 5.4 Form Elements

**Text Input:**
```tsx
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
  <input className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
  <p className="mt-1 text-xs text-slate-500">Brief description of the issue (max 100 characters)</p>
</div>
```

**Textarea:**
```tsx
<textarea className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none" rows={4} />
```

**Select / Dropdown:**
```tsx
<select className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none">
  <option>Select status</option>
</select>
```

### 5.5 XP Progress Bar

```tsx
<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <LevelBadge level={3} title="Active Citizen" />
    </div>
    <span className="text-xs text-slate-500">150 / 350 XP to next level</span>
  </div>
  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
      style={{ width: '43%' }}
    />
  </div>
  <p className="mt-2 text-xs text-slate-500">
    200 more XP to reach <span className="font-semibold text-purple-600">Community Voice</span>
  </p>
</div>
```

### 5.6 Image Upload Zone

```tsx
{/* Empty state */}
<div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-brand-400 hover:bg-brand-50/50 transition-all cursor-pointer">
  <CameraIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
  <p className="text-sm font-medium text-slate-700">Tap to take a photo or upload</p>
  <p className="text-xs text-slate-500 mt-1">JPG or PNG, max 10MB</p>
</div>

{/* With preview */}
<div className="relative rounded-xl overflow-hidden border border-slate-200">
  <img className="w-full h-48 object-cover" />
  <button className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
    <XIcon className="w-4 h-4" />
  </button>
  {/* Validation checklist below image */}
  <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-1.5">
    <ValidationCheck passed={true} label="Valid file format" />
    <ValidationCheck passed={true} label="Sufficient resolution" />
    <ValidationCheck passed={false} label="Photo metadata detected" />
    <ValidationCheck passed={true} label="File size OK" />
  </div>
</div>

{/* Validation check item */}
<div className="flex items-center gap-2">
  {passed ? 
    <CheckCircleIcon className="w-4 h-4 text-green-500" /> : 
    <XCircleIcon className="w-4 h-4 text-red-500" />
  }
  <span className={`text-xs ${passed ? 'text-green-700' : 'text-red-700'}`}>{label}</span>
</div>
```

### 5.7 Step Indicator (Submission Form)

```tsx
<div className="flex items-center justify-between mb-8">
  {steps.map((step, i) => (
    <div key={i} className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
        ${i < currentStep ? 'bg-brand-500 text-white' : 
          i === currentStep ? 'bg-brand-500 text-white ring-4 ring-brand-100' : 
          'bg-slate-200 text-slate-500'}`}>
        {i < currentStep ? <CheckIcon className="w-4 h-4" /> : i + 1}
      </div>
      {i < steps.length - 1 && (
        <div className={`w-12 md:w-24 h-0.5 mx-2 ${i < currentStep ? 'bg-brand-500' : 'bg-slate-200'}`} />
      )}
    </div>
  ))}
</div>
```

---

## 6. Page-by-Page Design Specifications

### 6.1 Landing Page (`/`)

**Layout:** Full-screen hero, no sidebar.

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] CivicPulse                    [Sign In →]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         See Something? Say Something.                   │
│         Report civic issues in 60 seconds.              │
│         Track real change in your neighbourhood.        │
│                                                         │
│         [Get Started with Google →]                     │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│   │ 📸       │  │ 📍       │  │ ✅       │             │
│   │ Snap a   │  │ Auto     │  │ Track    │             │
│   │ Photo    │  │ Location │  │ Progress │             │
│   └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │         [ LIVE MAP PREVIEW - read only ]         │   │
│   │         showing recent complaints as dots        │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design notes:**
- Hero text left-aligned on desktop, centered on mobile
- Background: very subtle gradient `from-slate-50 to-brand-50`
- CTA button: large, primary style, full-width on mobile
- Three feature cards: horizontal on desktop, vertical stack on mobile
- Optional: show a read-only map at the bottom with recent public complaints to build trust
- The landing page should feel **serious and civic**, not like a playful startup

### 6.2 Login Page (`/login`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [CivicPulse Logo]                     │
│                                                         │
│              ┌─────────────────────────┐                │
│              │                         │                │
│              │    Welcome to           │                │
│              │    CivicPulse           │                │
│              │                         │                │
│              │    Report issues.       │                │
│              │    Earn impact.         │                │
│              │    Improve your city.   │                │
│              │                         │                │
│              │  [🔵 Sign in with       │                │
│              │       Google]           │                │
│              │                         │                │
│              │  By signing in you      │                │
│              │  agree to our Terms     │                │
│              └─────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design notes:**
- Centered card on `bg-slate-50` background
- Card: `bg-white rounded-2xl shadow-lg p-8 max-w-sm mx-auto`
- Google button should follow Google's brand guidelines (white bg, Google "G" logo, dark text)
- Single focus: just the sign-in. No distractions.

### 6.3 User Dashboard (`/dashboard`)

```
Desktop:
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] CivicPulse     Dashboard  Submit  Leaderboard   [👤 XP]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Good morning, Kalyan 👋                                        │
│  Community Voice • Level 4 • 350 XP                             │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📝 12    │ │ ✅ 8     │ │ ⚡ 350   │ │ 🏆 #5    │           │
│  │ Reports  │ │ Resolved │ │ XP Points│ │ Rank     │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  [============================--------] 200 XP to Civic Champ   │
│                                                                 │
│  ┌────────────────────────────────┐  ┌────────────────────────┐ │
│  │                                │  │  Recent Activity       │ │
│  │      🗺️ LIVE COMPLAINT MAP     │  │                        │ │
│  │                                │  │  🔴 Pothole on MG Rd   │ │
│  │    (Leaflet + OSM tiles)       │  │     Submitted • 2h ago │ │
│  │    Colored markers per         │  │                        │ │
│  │    category                    │  │  🟡 Broken streetlight │ │
│  │                                │  │     Under Review • 1d  │ │
│  │    [Filter: 🔴🟡🟢🔵⚫ All]    │  │                        │ │
│  │                                │  │  🟢 Drainage issue     │ │
│  │                                │  │     Resolved • 3d ago  │ │
│  │                                │  │                        │ │
│  └────────────────────────────────┘  │  [View All →]          │ │
│                                      └────────────────────────┘ │
│                                                                 │
│              [+ Submit New Report]  (floating on mobile)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────┐
│ ☰ CivicPulse   [👤]  │
├──────────────────────┤
│ Hi Kalyan 👋         │
│ Lv.4 Active Citizen  │
│                      │
│ ┌────────┐┌────────┐ │
│ │ 📝 12  ││ ✅ 8   │ │
│ │Reports ││Resolved│ │
│ └────────┘└────────┘ │
│ ┌────────┐┌────────┐ │
│ │ ⚡ 350 ││ 🏆 #5  │ │
│ │  XP    ││ Rank   │ │
│ └────────┘└────────┘ │
│                      │
│ [==========----]     │
│ 200 XP to next level │
│                      │
│ ┌──────────────────┐ │
│ │  🗺️ MAP           │ │
│ │  (full width)    │ │
│ │  (60vh height)   │ │
│ │                  │ │
│ │ [Filters ▾]      │ │
│ └──────────────────┘ │
│                      │
│ Recent Activity      │
│ ┌──────────────────┐ │
│ │ 🔴 Pothole...    │ │
│ │ 🟡 Streetlight...│ │
│ │ 🟢 Drainage...   │ │
│ └──────────────────┘ │
│                      │
│     [+ Report] (FAB) │
└──────────────────────┘
```

**Design notes:**
- **Map gets 2/3 width on desktop**, sidebar gets 1/3
- **Map height:** `h-[500px]` on desktop, `h-[60vh]` on mobile
- **FAB (Floating Action Button) on mobile:** Fixed bottom-right, `bg-brand-500`, circular, `+` icon, `shadow-lg`, `z-50`
- Stats grid: 4 columns on desktop, 2x2 on mobile
- Recent activity: scrollable list, max 5 items visible, "View All" link
- Greeting uses time of day: "Good morning/afternoon/evening"

### 6.4 Submit Complaint (`/dashboard/submit`)

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]                                      │
│                                                             │
│  Report an Issue                                            │
│                                                             │
│  (1)───(2)───(3)───(4)───(5)                                │
│  Cat   Photo  Loc   Info  Review                            │
│                                                             │
│  STEP 1: What type of issue?                                │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  🚧      │  │  💡      │  │  🗑️      │                   │
│  │  Road    │  │  Street  │  │  Sanit-  │                   │
│  │  Damage  │  │  light   │  │  ation   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  🏗️      │  │  💧      │  │  ⚠️      │                   │
│  │  Public  │  │  Water   │  │  Safety  │                   │
│  │  Property│  │  Supply  │  │  Hazard  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  📋      │  │  🌳      │  │  ❓      │                   │
│  │  Public  │  │  Greenery│  │  Other   │                   │
│  │  Notice  │  │          │  │          │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                             │
│                              [Next →]                       │
└─────────────────────────────────────────────────────────────┘
```

**Category card design:**
```tsx
<button className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
  ${selected 
    ? 'border-brand-500 bg-brand-50 shadow-sm' 
    : 'border-slate-200 bg-white hover:border-slate-300'}`}>
  <span className="text-2xl">{icon}</span>
  <span className="text-sm font-medium text-slate-700">{label}</span>
</button>
```

- Categories in a 3-column grid (all screen sizes)
- Selected state: blue border + light blue background
- Only 1 selection allowed
- Next button disabled until selection made

**Steps 2-5** follow the same container layout, swapping only the inner content per the component specs in Section 5.

### 6.5 Complaint Detail (`/complaint/[id]`)

```
┌──────────────────────────────────────────────────────────┐
│  [← Back]                                     [⬆️ Share] │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              [COMPLAINT PHOTO]                     │  │
│  │              (full width, max-h-80, object-cover)  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────┐ ┌────────────────┐                      │
│  │ 🚧 Road     │ │ 🟡 Under       │                      │
│  │    Damage   │ │    Review      │                      │
│  └─────────────┘ └────────────────┘                      │
│                                                          │
│  Massive pothole on MG Road near Signal                  │
│                                                          │
│  The pothole is about 2 feet wide and has been           │
│  causing vehicles to swerve dangerously...               │
│                                                          │
│  📍 MG Road, Koramangala, Bangalore                      │
│  🕐 Submitted 2 hours ago                                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [MINI MAP showing pin location]                   │  │
│  │  (h-48, rounded-xl)                                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [❤️ 12 Upvotes]                  [👤 By Rahul K]  │  │
│  │                                    Lv.3 Active Ctz │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Activity                                                │
│  ───────                                                 │
│  🟡 Status changed to Under Review         — 1h ago     │
│  📝 Submitted                                — 2h ago     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Design notes:**
- Photo is the hero — full width, rounded bottom corners on mobile
- Upvote button is prominent: large tap target, clear filled/unfilled state
- Activity timeline uses a vertical line with dots (simple `border-l-2` + `w-2 h-2 rounded-full`)
- Mini map is non-interactive (static view of complaint location)

### 6.6 Leaderboard (`/leaderboard`)

```
┌─────────────────────────────────────────────────────────────┐
│  Leaderboard                                                │
│  Top contributors in your community                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🥇  [👤]  Priya Sharma    Civic Champion   ⚡ 780 XP  ││
│  │  🥈  [👤]  Rahul Kumar     Active Citizen   ⚡ 520 XP  ││
│  │  🥉  [👤]  Anita Desai     Active Citizen   ⚡ 480 XP  ││
│  │───────────────────────────────────────────────────────── ││
│  │  4.  [👤]  Kalyan M. ← YOU Community Voice  ⚡ 350 XP  ││
│  │  5.  [👤]  Suresh Reddy    Citizen          ⚡ 120 XP  ││
│  │  ...                                                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design notes:**
- Top 3 get medal emojis and slightly elevated card style
- Current user's row highlighted with `bg-brand-50 border-l-4 border-brand-500`
- Each row: rank, avatar (36x36 rounded-full), name, level badge, XP
- Mobile: same layout, just tighter spacing

### 6.7 Admin Dashboard (`/admin`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [ADMIN]  CivicPulse Admin     Dashboard  Queue    [👤 Sign Out]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin Dashboard                                                │
│                                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ 📊 156 │ │ 🟡 23  │ │ 🔵 12  │ │ ✅ 98  │ │ ❌ 23  │       │
│  │ Total  │ │Pending │ │In Prog │ │Resolved│ │Rejected│       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              [ FULL SYSTEM MAP - all complaints ]            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Complaint Queue                           [Filter ▾] [Sort ▾] │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔴 CRITICAL │ Exposed wire on main road │ ⬆12 │ 30m ago   ││
│  │ 🟠 HIGH     │ Open manhole near school  │ ⬆8  │ 2h ago    ││
│  │ 🟡 MEDIUM   │ Broken streetlight        │ ⬆4  │ 5h ago    ││
│  │ ⚪ LOW      │ Faded bus stop sign       │ ⬆1  │ 1d ago    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Design notes:**
- Admin navbar has a distinct `bg-slate-800` or `bg-brand-800` dark background to differentiate from citizen UI
- Stats row: 5 columns on desktop, scrollable horizontal on mobile
- Queue is the main focus — sortable, filterable table
- Priority indicators use colored left borders: `border-l-4 border-red-500` for critical
- Click any row → opens admin complaint detail with management controls

### 6.8 Admin Complaint Detail (`/admin/complaint/[id]`)

Same as user complaint detail (section 6.5) PLUS an admin action panel:

```
┌────────────────────────────────────────┐
│  Admin Actions                         │
│                                        │
│  Status:  [Under Review ▾]             │
│                                        │
│  Priority: ○ Low  ● Medium  ○ High    │
│            ○ Critical                  │
│                                        │
│  Notes:                                │
│  ┌──────────────────────────────────┐  │
│  │ Engineer dispatched to location  │  │
│  │ for assessment...                │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [Update Complaint]                    │
│                                        │
└────────────────────────────────────────┘
```

- Admin panel sits in a card with a subtle `bg-slate-50` background and `border-l-4 border-brand-500`
- Status dropdown updates immediately on selection
- Priority uses radio button group (custom styled)
- Notes is a textarea

---

## 7. Map Design

### 7.1 Tile Style
- Use default OpenStreetMap tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Default zoom: 14 (neighbourhood level)
- Min zoom: 10, Max zoom: 18

### 7.2 Custom Markers
Use **colored circle markers** instead of default Leaflet pins for a cleaner look:

```typescript
import L from 'leaflet';

const CATEGORY_COLORS: Record<string, string> = {
  road_damage: '#EF4444',      // red
  streetlight: '#F59E0B',      // amber
  sanitation: '#16A34A',       // green
  public_property: '#3B82F6',  // blue
  water_supply: '#06B6D4',     // cyan
  safety_hazard: '#EA580C',    // orange
  public_notice: '#A855F7',    // purple
  greenery: '#10B981',         // emerald
  other: '#94A3B8',            // slate
};

function createMarkerIcon(category: string, status: string) {
  const color = CATEGORY_COLORS[category] || '#94A3B8';
  const resolved = status === 'resolved';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${resolved ? '#D1D5DB' : color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ${resolved ? 'opacity: 0.6;' : ''}
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
```

### 7.3 Map Popup

```tsx
<Popup>
  <div className="min-w-[200px]">
    <div className="flex items-center gap-2 mb-1">
      <CategoryBadge small />
      <StatusBadge small />
    </div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    <p className="text-xs text-slate-500 mt-1">{address}</p>
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
      <span className="text-xs text-slate-500">❤️ {upvotes}</span>
      <a className="text-xs font-medium text-brand-600 hover:text-brand-700">View →</a>
    </div>
  </div>
</Popup>
```

### 7.4 Map Controls Position
- Zoom controls: top-right (default)
- Filter controls: bottom-left, overlay on map
- User location button: top-left, custom control

---

## 8. Animations & Transitions

Keep animations subtle and functional. No decorative animations.

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | None (instant) | — | — |
| Card hover | `shadow-sm → shadow-md` | 150ms | ease-out |
| Button hover | Background color shift | 150ms | ease-out |
| Toast appear | Slide up + fade in | 300ms | ease-out |
| Toast dismiss | Slide down + fade out | 200ms | ease-in |
| XP counter | Count up animation | 500ms | ease-out |
| Progress bar fill | Width transition | 500ms | ease-out |
| Map marker appear | Scale from 0 → 1 | 200ms | spring |
| Modal/panel | Fade in + slight scale | 200ms | ease-out |
| Step transition | Slide left/right | 250ms | ease-in-out |

**Tailwind classes to use:**
```css
transition-shadow duration-150
transition-colors duration-150
transition-all duration-300
```

**No animation on:**
- Initial page loads (use skeleton loaders instead)
- Data updates (instant swap)
- Navigation

---

## 9. Loading & Empty States

### 9.1 Skeleton Loaders
Use pulsing gray blocks that match the shape of final content:

```tsx
{/* Skeleton card */}
<div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
  <div className="flex gap-4">
    <div className="w-20 h-20 rounded-lg bg-slate-200" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-1/4" />
    </div>
  </div>
</div>

{/* Skeleton stat card */}
<div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-slate-200" />
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-16" />
      <div className="h-6 bg-slate-200 rounded w-12" />
    </div>
  </div>
</div>
```

### 9.2 Empty States
Always include illustration + message + CTA:

```tsx
{/* No complaints */}
<div className="text-center py-12">
  <MapPinIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
  <h3 className="text-lg font-semibold text-slate-700 mb-1">No reports yet</h3>
  <p className="text-sm text-slate-500 mb-4">Be the first to report an issue in your area</p>
  <Link href="/dashboard/submit">
    <Button>Submit a Report</Button>
  </Link>
</div>
```

---

## 10. Toast Notifications

**Position:** Bottom-center on mobile, bottom-right on desktop.

```tsx
{/* Success toast */}
<div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl shadow-lg max-w-sm">
  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
  <div>
    <p className="text-sm font-medium text-green-800">Report Submitted!</p>
    <p className="text-xs text-green-600">+10 XP earned</p>
  </div>
  <button className="ml-auto p-1 text-green-400 hover:text-green-600">
    <XIcon className="w-4 h-4" />
  </button>
</div>

{/* Error toast */}
<div className="... bg-red-50 border-red-200 ...">
  <XCircleIcon className="... text-red-600" />
  <p className="... text-red-800">...</p>
</div>
```

**Auto-dismiss:** 4 seconds for success, manual dismiss for errors.

---

## 11. Responsive Breakpoints

| Breakpoint | Tailwind | Usage |
|------------|----------|-------|
| Mobile | default (< 640px) | Single column, full-width, FAB for submit |
| Small tablet | `sm:` (640px) | Minor adjustments |
| Tablet | `md:` (768px) | 2-column grids, larger padding |
| Desktop | `lg:` (1024px) | Sidebar layouts, 3-column grids |
| Large desktop | `xl:` (1280px) | Max content width caps |

### 11.1 Key Responsive Patterns
- **Dashboard:** Stacked (mobile) → Sidebar + Map (desktop)
- **Stats:** 2x2 grid (mobile) → 4 columns (desktop)
- **Submit form:** Full-width card (mobile) → Centered card max-w-2xl (desktop)
- **Admin queue:** Card list (mobile) → Table (desktop)
- **Nav:** Hamburger + slide-out (mobile) → Horizontal links (desktop)
- **Map:** Full-width, 60vh (mobile) → 2/3 width, fixed height (desktop)

---

## 12. Accessibility Checklist

- [ ] All interactive elements have focus styles (`focus:ring-2 focus:ring-brand-500`)
- [ ] Color is never the only indicator (always pair with text/icon)
- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Status badges use text, not just color
- [ ] Touch targets ≥ 44x44px
- [ ] Contrast ratio ≥ 4.5:1 for all text
- [ ] Map markers have tooltips
- [ ] Keyboard navigation works for all flows

---

## 13. Icon Reference (Lucide React)

| Usage | Icon Name | Import |
|-------|-----------|--------|
| Road damage | `Construction` | `import { Construction } from 'lucide-react'` |
| Streetlight | `Lightbulb` | `import { Lightbulb } from 'lucide-react'` |
| Sanitation | `Trash2` | `import { Trash2 } from 'lucide-react'` |
| Public property | `Building` | `import { Building } from 'lucide-react'` |
| Water supply | `Droplets` | `import { Droplets } from 'lucide-react'` |
| Safety hazard | `AlertTriangle` | `import { AlertTriangle } from 'lucide-react'` |
| Public notice | `FileText` | `import { FileText } from 'lucide-react'` |
| Greenery | `Trees` | `import { Trees } from 'lucide-react'` |
| Other | `HelpCircle` | `import { HelpCircle } from 'lucide-react'` |
| XP / Points | `Zap` | `import { Zap } from 'lucide-react'` |
| Level | `Shield` | `import { Shield } from 'lucide-react'` |
| Upvote | `Heart` | `import { Heart } from 'lucide-react'` |
| Location | `MapPin` | `import { MapPin } from 'lucide-react'` |
| Camera | `Camera` | `import { Camera } from 'lucide-react'` |
| Submit | `Plus` | `import { Plus } from 'lucide-react'` |
| Back | `ArrowLeft` | `import { ArrowLeft } from 'lucide-react'` |
| Menu | `Menu` | `import { Menu } from 'lucide-react'` |
| Close | `X` | `import { X } from 'lucide-react'` |
| Check | `Check` | `import { Check } from 'lucide-react'` |
| Success | `CheckCircle` | `import { CheckCircle } from 'lucide-react'` |
| Error | `XCircle` | `import { XCircle } from 'lucide-react'` |
| Search | `Search` | `import { Search } from 'lucide-react'` |
| Filter | `Filter` | `import { Filter } from 'lucide-react'` |
| Sort | `ArrowUpDown` | `import { ArrowUpDown } from 'lucide-react'` |
| Admin | `ShieldCheck` | `import { ShieldCheck } from 'lucide-react'` |
| Leaderboard | `Trophy` | `import { Trophy } from 'lucide-react'` |
| Clock / Time | `Clock` | `import { Clock } from 'lucide-react'` |
| Share | `Share2` | `import { Share2 } from 'lucide-react'` |

---

## 14. Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A5F',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 15. Implementation Checklist for Claude Code

When implementing, follow this exact order and check each box:

### Foundation
- [ ] Next.js 14 setup with App Router + TypeScript + Tailwind
- [ ] Install all dependencies from PRD package list
- [ ] Configure Tailwind with extended theme (colors, fonts, shadows)
- [ ] Set up `globals.css` with `@import 'leaflet/dist/leaflet.css'`
- [ ] Create Firebase config in `lib/firebase/config.ts`

### Auth
- [ ] Create `AuthProvider.tsx` with Google sign-in
- [ ] Create `ProtectedRoute.tsx` component
- [ ] Create `/login` page matching section 6.2 design
- [ ] User document creation on first sign-in

### Layout
- [ ] Create `Navbar.tsx` — responsive, with XP badge
- [ ] Create root layout wrapping AuthProvider
- [ ] Create dashboard layout (protected)
- [ ] Create admin layout (admin-protected, dark navbar)

### Dashboard
- [ ] Create stat cards matching section 5.1 designs
- [ ] Create XP progress bar matching section 5.5
- [ ] Create map component with dynamic import (SSR disabled)
- [ ] Custom category markers (section 7.2)
- [ ] Map popups (section 7.3)
- [ ] Map category filters
- [ ] Recent activity feed
- [ ] Mobile FAB button

### Submit Flow
- [ ] Step indicator component (section 5.7)
- [ ] Category picker (section 6.4)
- [ ] Image upload with drag-drop (section 5.6)
- [ ] Image validation with visual checklist
- [ ] Location capture with mini-map
- [ ] Details form (title + description)
- [ ] Review step with all info summary
- [ ] Submission processing with XP award

### Complaint Detail
- [ ] Complaint detail page (section 6.5)
- [ ] Upvote button with optimistic UI
- [ ] Activity timeline
- [ ] Mini location map

### Leaderboard
- [ ] Leaderboard page (section 6.6)
- [ ] Current user highlighting

### Admin
- [ ] Admin dashboard (section 6.7)
- [ ] Admin stats row
- [ ] Complaint queue with filters/sort
- [ ] Admin complaint detail with action panel (section 6.8)
- [ ] Status update + XP award logic
- [ ] Priority management

### Polish
- [ ] Skeleton loaders for all async states
- [ ] Empty states for all lists
- [ ] Toast notification system
- [ ] Error boundary for map
- [ ] Responsive testing at 375px, 768px, 1440px
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
