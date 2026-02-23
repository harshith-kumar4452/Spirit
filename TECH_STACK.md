# GenSathi — Complete Tech Stack Documentation

> **Project:** GenSathi — A civic complaint management platform that allows citizens to report, track, and upvote local issues, and lets administrators manage, prioritize, and resolve them in real time.
>
> **Built for:** Webathon Hackathon  
> **Date:** February 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Frontend Framework](#2-frontend-framework)
3. [Language & Type Safety](#3-language--type-safety)
4. [Styling](#4-styling)
5. [Backend & Database](#5-backend--database)
6. [Authentication](#6-authentication)
7. [File Storage](#7-file-storage)
8. [Mapping & Geolocation](#8-mapping--geolocation)
9. [UI Component Libraries](#9-ui-component-libraries)
10. [Utilities & Helpers](#10-utilities--helpers)
11. [Gamification System](#11-gamification-system)
12. [Validation](#12-validation)
13. [Dev Tooling](#13-dev-tooling)
14. [Project Structure](#14-project-structure)
15. [Key Features & Pages](#15-key-features--pages)
16. [Environment Variables](#16-environment-variables)
17. [Deployment & Config](#17-deployment--config)
18. [Design System](#18-design-system)

---

## 1. Project Overview

GenSathi is a full-stack web application where:

- **Citizens** can report civic problems (potholes, garbage, flooding, etc.) with photo evidence, geolocation, and descriptions. They earn XP points for submitting and having their complaints resolved.
- **Admins** can view all complaints on a live map, accept/reject them, update their status with proof images (including before/after repair photos for resolution), and view analytics on a dedicated dashboard.

---

## 2. Frontend Framework

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | `^16.1.6` | Full-stack React framework with App Router, server/client components, dynamic routing, and Turbopack dev server |
| **React** | `^19.2.4` | Core UI library |
| **React DOM** | `^19.2.4` | DOM rendering |

### Next.js Features Used
- **App Router** (`app/` directory) with nested layouts
- **Dynamic Routes** — `/admin/complaint/[id]`, `/complaint/[id]`
- **`next/dynamic`** — Used extensively for SSR-safe Leaflet map imports with `{ ssr: false }`
- **`next/link`** — Client-side navigation
- **`next/navigation`** — `usePathname`, `useParams`, `useRouter` hooks
- **`next/image`** — (available, used selectively)
- **Turbopack** — Dev server bundler

---

## 3. Language & Type Safety

| Technology | Version | Purpose |
|---|---|---|
| **TypeScript** | `^5.9.3` | Static type checking throughout the entire codebase |
| **@types/react** | `^19.2.14` | React type definitions |
| **@types/node** | `^25.3.0` | Node.js type definitions |
| **@types/leaflet** | `^1.9.21` | Leaflet map type definitions |

### Custom Types (defined in `lib/utils/types.ts`)
- `Complaint` — full complaint document shape
- `User` — user profile including XP, level, role
- `ActivityLog` — admin action history per complaint
- `ComplaintStatus` — union: `'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected'`
- `Priority` — union: `'low' | 'medium' | 'high' | 'critical'`
- `Category` — union of all civic complaint categories

---

## 4. Styling

| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | `^3.4.1` | Utility-first CSS framework |
| **PostCSS** | `^8.5.6` | CSS processing pipeline |
| **Autoprefixer** | `^10.4.24` | Cross-browser vendor prefixes |

### Design System Highlights
- **Color Palette:** Deep navy/space dark (`#0B1120`, `#0F172A`, `#060D1F`) backgrounds throughout admin
- **Glassmorphism:** `backdrop-blur-xl`, `bg-white/5`, `border-white/10` for frosted glass cards
- **Gradients:** `linear-gradient(160deg, #0f0c29, #1a1040, #24243e)` for admin panels
- **Glow Shadows:** Custom `shadow-[0_0_25px_rgba(...)]` for buttons, icons, and cards
- **Brand Colors:** Blue (`brand-500` = `#3b82f6`) + Violet (`#8b5cf6`) dual-tone accent
- **Ambient Orbs:** Blurred `div` circles with `bg-violet-600/20 blur-3xl` for depth

### Tailwind Config (`tailwind.config.ts`)
- Custom `brand` color scale (maps to blue-500 family)
- Extended with custom `fontFamily`

---

## 5. Backend & Database

| Technology | Version | Purpose |
|---|---|---|
| **Firebase** | `^12.9.0` | Full backend suite |
| **Firestore** | (included in Firebase) | NoSQL real-time document database |

### Firestore Collections
| Collection | Description |
|---|---|
| `complaints` | All civic complaints with location, status, priority, images, upvotes |
| `complaints/{id}/activity` | Activity log sub-collection per complaint |
| `users` | User profiles with XP, level, role, stats |

### Firestore Features Used
- `onSnapshot` — Real-time listeners on complaints and activity logs
- `serverTimestamp()` — Server-side timestamp on all writes
- `increment()` — Atomic XP and upvote counter updates
- `arrayUnion / arrayRemove` — Upvote tracking without duplicates
- `runTransaction` — Atomic upvote toggle (read → check → write)
- `where` / `orderBy` — Filtered queries (by status, date)
- `getDoc` / `addDoc` / `updateDoc` — Standard CRUD
- **Geohash indexing** — Location stored as geohash for spatial queries

### Firestore Rules (`firestore.rules`)
- Complaints: authenticated write, public read
- Users: own-document write only
- Activity logs: admin-only write

### Firestore Indexes (`firestore.indexes.json`)
- Composite index on `status + createdAt` for filtered complaint queries

---

## 6. Authentication

| Technology | Purpose |
|---|---|
| **Firebase Authentication** | User sign-up, sign-in, and session management |
| **Google OAuth Provider** | One-click Google sign-in |
| **Email/Password Provider** | Traditional email + password auth |

### Auth Flow
1. Sign in/up via `lib/firebase/auth.ts`
2. On first login, `ensureUserDocument()` creates a Firestore user doc
3. Admin role assigned by checking email against `ADMIN_EMAILS` constant array
4. `useAuth()` custom hook (in `lib/hooks/useAuth.ts`) exposes `user`, `userData`, `signOut` throughout the app

### Admin Emails (hardcoded for hackathon)
```
kumarharshith4452@gmail.com
ayyagariabhinav21@gmail.com
```

---

## 7. File Storage

| Technology | Version | Purpose |
|---|---|---|
| **Firebase Storage** | (included in Firebase) | Cloud image storage |
| **Cloudinary** | `^2.9.0` | Alternative image CDN (available, integrated) |

### Storage Usage (`lib/firebase/storage.ts`)
- `uploadComplaintImage(file, complaintId)` — Uploads to `complaints/{id}/{timestamp}_{filename}`
- `deleteComplaintImage(path)` — Removes uploaded image

### Admin Image Upload Requirements (newly added)
- **Any status update:** Admin must upload a **proof/update image**
- **Resolve status specifically:** Admin must upload both:
  - 📷 **Before Repair** photo
  - 📷 **After Repair** photo
- URLs stored in activity log notes after upload

---

## 8. Mapping & Geolocation

| Technology | Version | Purpose |
|---|---|---|
| **Leaflet** | `^1.9.4` | Interactive map rendering library |
| **react-leaflet** | `^5.0.0` | React bindings for Leaflet |
| **ngeohash** | `^0.6.3` | Geohash encoding for location indexing |
| **@types/leaflet** | `^1.9.21` | TypeScript types |
| **OpenStreetMap** | (free CDN tiles) | Map tile provider |

### Map Components (`components/map/`)
| Component | Purpose |
|---|---|
| `ComplaintMap.tsx` | Full interactive map with all complaint pins, clustering, filters |
| `SingleLocationMap.tsx` | Single-pin read-only map for complaint detail pages |
| `PublicMap.tsx` | Public-facing map on landing page |

### Map Features
- Custom color-coded markers (red active, green resolved)
- Client-side only via `next/dynamic` with `{ ssr: false }` to avoid SSR hydration crash
- `mounted` state guard inside `SingleLocationMap` to prevent Leaflet `appendChild` errors
- `MapUpdater` component with try/catch guard for `setView` calls
- Geohash stored per complaint for future spatial indexing

---

## 9. UI Component Libraries

| Technology | Version | Purpose |
|---|---|---|
| **lucide-react** | `^0.575.0` | Icon library (500+ SVG icons used throughout) |

### Icons Used Extensively
`Shield`, `MapPin`, `Clock`, `Heart`, `Upload`, `ThumbsUp`, `ThumbsDown`, `Eye`, `ArrowRight`, `ArrowLeft`, `FileText`, `CheckCircle`, `XCircle`, `AlertCircle`, `List`, `LayoutDashboard`, `Zap`, `Menu`, `X`, `ImagePlus`, `Activity`, `User`, `Search`, `TrendingUp`, `BarChart2`, `ChevronRight`, `Plus`, `Camera`

---

## 10. Utilities & Helpers

| Technology | Version | Purpose |
|---|---|---|
| **date-fns** | `^4.1.0` | Date formatting and relative time |

### Custom Helpers (`lib/utils/helpers.ts`)
```typescript
timeAgo(timestamp)     // "3 hours ago" — with null guard
formatDate(timestamp)  // "February 21, 2026" — with null guard
truncate(str, length)  // Truncates with "..."
cn(...classes)         // Conditional class merging utility
```

### Constants (`lib/utils/constants.ts`)
- `STATUS_LABELS` — Human-readable status names
- `CATEGORY_LABELS` — Complaint category display names
- `PRIORITY_COLORS` — Tailwind color classes per priority
- `ADMIN_EMAILS` — Hardcoded admin email list

---

## 11. Gamification System

Fully custom XP + level system built in `lib/gamification/xpEngine.ts`

### XP Rewards
| Action | XP |
|---|---|
| Submit a complaint | +10 XP |
| Complaint verified (under review) | +15 XP |
| Complaint resolved | +30 XP |
| Complaint rejected | −5 XP |
| Give an upvote | +1 XP |
| Receive an upvote | +2 XP |

### Level Thresholds
| Level | Title | XP Required |
|---|---|---|
| 1 | Newcomer | 0 |
| 2 | Citizen | 50 |
| 3 | Active Citizen | 150 |
| 4 | Community Voice | 350 |
| 5 | Civic Champion | 600 |
| 6 | Neighbourhood Guardian | 1000 |
| 7 | City Hero | 1500 |

### Admin XP Protection
Admins **never earn XP** from accepting/rejecting complaints — the system checks `role !== 'admin'` before awarding any XP.

---

## 12. Validation

| Technology | Version | Purpose |
|---|---|---|
| **Zod** | `^4.3.6` | Schema-based runtime validation |

Used in `lib/validation/` for complaint form input validation before Firestore writes.

---

## 13. Dev Tooling

| Technology | Version | Purpose |
|---|---|---|
| **ESLint** | `^9.39.3` | Code linting |
| **eslint-config-next** | `^16.1.6` | Next.js ESLint rules |
| **TypeScript** | `^5.9.3` | Type checking |
| **Turbopack** | (bundled in Next.js 16) | Ultra-fast dev build server |

---

## 14. Project Structure

```
civicdo-master/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with Navbar
│   ├── page.tsx                  # Landing page (cinematic hero + map)
│   ├── login/
│   │   └── page.tsx              # Dark glassmorphism sign-in/sign-up
│   ├── dashboard/
│   │   ├── page.tsx              # Citizen dashboard (map + submit CTA) + WelcomeSplash
│   │   └── submit/page.tsx       # Submit new complaint form
│   ├── complaint/[id]/
│   │   └── page.tsx              # Public complaint detail view
│   ├── status/
│   │   └── page.tsx              # Citizen's own complaint status tracker
│   ├── leaderboard/
│   │   └── page.tsx              # XP leaderboard
│   ├── admin/
│   │   ├── page.tsx              # Admin home: full-screen map + action panel
│   │   ├── dashboard/page.tsx    # Admin analytics dashboard
│   │   ├── complaints/page.tsx   # Admin complaint card grid with accept/reject
│   │   └── complaint/[id]/
│   │       └── page.tsx          # Admin complaint detail: status + image upload
│   └── api/                      # Next.js API routes
│
├── components/
│   ├── auth/                     # Auth form components
│   ├── complaints/               # CategoryBadge, StatusBadge, ComplaintCard
│   ├── dashboard/                # Dashboard-specific widgets
│   ├── gamification/             # XP progress bar, level badge
│   ├── map/
│   │   ├── ComplaintMap.tsx      # Multi-pin complaint map
│   │   ├── SingleLocationMap.tsx # Single-pin detail map
│   │   └── PublicMap.tsx         # Landing page map
│   └── ui/
│       ├── Navbar.tsx            # Adaptive dark glassmorphism navbar
│       ├── LoadingSpinner.tsx    # Spinner component
│       ├── Toast.tsx             # Toast notification system
│       └── WelcomeSplash.tsx     # Post-login video splash screen
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts             # Firebase app init (auth, db, storage)
│   │   ├── auth.ts               # signIn, signUp, Google OAuth, ensureUserDocument
│   │   ├── firestore.ts          # createComplaint, updateComplaintStatus, toggleUpvote
│   │   └── storage.ts            # uploadComplaintImage, deleteComplaintImage
│   ├── gamification/
│   │   └── xpEngine.ts           # XP rewards, level thresholds, calculateLevel()
│   ├── geo/                      # Geolocation utilities
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state hook
│   │   └── useGeolocation.ts     # Browser GPS hook
│   ├── utils/
│   │   ├── types.ts              # All TypeScript interfaces
│   │   ├── constants.ts          # STATUS_LABELS, ADMIN_EMAILS, XP constants
│   │   └── helpers.ts            # timeAgo, formatDate, truncate, cn
│   ├── validation/               # Zod schemas
│   └── cloudinary/               # Cloudinary upload helper
│
├── public/
│   ├── signvideo.mp4             # Post-login welcome splash video
│   └── default-avatar.png        # Fallback avatar image
│
├── styles/
│   └── globals.css               # Global CSS + Tailwind directives
│
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Composite indexes definition
├── firebase.json                 # Firebase project config
├── storage.rules                 # Firebase Storage security rules
├── tailwind.config.ts            # Tailwind + custom brand colors
├── next.config.mjs               # Next.js config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies & scripts
```

---

## 15. Key Features & Pages

### Citizen-Facing
| Page | Feature |
|---|---|
| `/` | Cinematic landing page with ambient glow animations, live public map, scroll sections |
| `/login` | Dark glassmorphism sign-in/sign-up with Google OAuth |
| `/dashboard` | Live map of all complaints + submit complaint CTA + **video welcome splash** on first login |
| `/dashboard/submit` | Multi-step complaint form with photo upload, GPS location picker, category selection |
| `/complaint/[id]` | Public complaint detail with map, upvote button, status timeline |
| `/status` | Personal complaint history and status tracker |
| `/leaderboard` | Top citizens ranked by XP |

### Admin-Facing
| Page | Feature |
|---|---|
| `/admin` | Split view: full-screen map left + action panel with stats right |
| `/admin/complaints` | Card grid of all complaints with search, filters, inline Accept/Reject |
| `/admin/complaint/[id]` | Full complaint detail with status update + mandatory image proof upload |
| `/admin/dashboard` | Analytics: resolution rate, status breakdown bar chart, top categories, recent activity |

---

## 16. Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

---

## 17. Deployment & Config

| Tool | Purpose |
|---|---|
| **Firebase Hosting** (optional) | Can deploy Next.js via Firebase |
| **Vercel** (recommended) | Native Next.js deployment |
| `npm run dev` | Start dev server (Turbopack, port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |

---

## 18. Design System

### Color Palette
| Name | Hex | Usage |
|---|---|---|
| Space Black | `#0B1120` | Main admin background |
| Deep Navy | `#0F172A` | Card backgrounds |
| Midnight | `#060D1F` | Navbar gradient |
| Cosmic Purple | `#0f0c29` | Admin panel gradient start |
| Indigo Dark | `#1a1040` | Admin panel gradient mid |
| Brand Blue | `#3b82f6` | Primary actions, active states |
| Violet | `#8b5cf6` | Accent, hover glow |

### Typography
- **Font:** System default (Inter/sans-serif via Tailwind)
- **Headings:** `font-black` / `font-bold` with `tracking-tight`
- **Labels:** `uppercase tracking-wider text-xs text-white/50`

### UI Patterns
| Pattern | Implementation |
|---|---|
| Glassmorphism cards | `bg-white/5 backdrop-blur-xl border border-white/10` |
| Ambient glow orbs | `div` with `blur-3xl rounded-full bg-violet-600/20` |
| Electric glow buttons | `shadow-[0_0_25px_rgba(99,102,241,0.4)]` |
| Gradient top border | `h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent` |
| Active nav indicator | Gradient pill + bottom line `via-brand-400` |
| Online status dot | `w-2.5 h-2.5 bg-emerald-400 rounded-full` absolutely positioned |
| Hero image gradient | `bg-gradient-to-t from-[#0B1120] via-transparent` overlay |
| Activity dot glow | `shadow-[0_0_10px_rgba(59,130,246,0.8)]` on timeline dots |

---

*Generated: February 21, 2026 — GenSathi v1.0.0*
