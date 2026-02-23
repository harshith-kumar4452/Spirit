# GenSathi — Tech Stack Pitch
### *Why We Built It This Way*

---

## 🎯 Our Engineering Philosophy

> **"Move fast, stay real-time, never sacrifice user trust."**

Every technology we chose answers one question:  
*Does this make the civic experience faster, more transparent, and more trustworthy?*

---

## 🏗️ The Stack at a Glance

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│         Next.js 16  ·  React 19  ·  TypeScript      │
├─────────────────────────────────────────────────────┤
│                    STYLING                          │
│              Tailwind CSS  ·  Vanilla CSS           │
├─────────────────────────────────────────────────────┤
│                    BACKEND                          │
│    Firebase Firestore  ·  Firebase Auth             │
│    Firebase Storage   ·  Cloudinary                 │
├─────────────────────────────────────────────────────┤
│                    MAPPING                          │
│       Leaflet  ·  react-leaflet  ·  OpenStreetMap   │
│                  ngeohash                           │
├─────────────────────────────────────────────────────┤
│                    UTILITIES                        │
│           Zod  ·  date-fns  ·  lucide-react         │
└─────────────────────────────────────────────────────┘
```

---

## 1. 🖥️ Next.js 16 — The Framework

**Why Next.js?**

We chose Next.js over plain React for three specific reasons:

| Need | How Next.js solves it |
|---|---|
| **SEO** on the public complaint pages | Server-side rendering built in |
| **Dynamic routing** for `/complaint/[id]`, `/admin/complaint/[id]` | File-based routing, zero config |
| **SSR-safe maps** | `next/dynamic` with `{ ssr: false }` lets Leaflet load only client-side |
| **Dev speed** | Turbopack dev server — hot reload in milliseconds |

> **Turbopack** (the new Next.js bundler) gave us sub-200ms hot reload during development — critical for iterating on UI during a hackathon.

---

## 2. ⚛️ React 19 — UI Layer

**Why React 19?**
- Concurrent rendering improvements mean map components and real-time Firestore listeners don't block each other
- `useEffect` + `useState` patterns gave us precise control over when Leaflet mounts (fixing the notorious `appendChild` crash)
- Composable component model let us reuse `CategoryBadge`, `StatusBadge`, `SingleLocationMap` across both citizen and admin flows

---

## 3. 🔷 TypeScript — Type Safety

**Why TypeScript?**

In a hackathon, bugs kill momentum. TypeScript's compiler caught errors **before runtime**, specifically:
- Wrong status string passed to `updateComplaintStatus`
- Null `timestamp` passed to `date-fns` (Firestore serverTimestamp resolves async)
- Wrong shape of Firestore document data

We defined strict interfaces: `Complaint`, `User`, `ActivityLog`, `ComplaintStatus`, `Priority` — any mismatch is a compile error, not a 2am debug session.

---

## 4. 🎨 Tailwind CSS — Styling

**Why Tailwind over plain CSS or a component library like MUI/Chakra?**

```
Speed     → No context switching between .css files
Control   → Every shadow, gradient, opacity exactly as designed
Dark mode → Native dark palette — no theme toggling complexity
Custom    → brand-500 color scale, arbitrary values like
            shadow-[0_0_25px_rgba(99,102,241,0.4)]
```

We built a full **glassmorphism design system** purely in Tailwind:
- Cards: `bg-white/5 backdrop-blur-xl border border-white/10`
- Glows: `shadow-[0_0_20px_rgba(236,72,153,0.2)]`
- Gradients: `bg-gradient-to-r from-violet-500 to-brand-600`

**No design library = no design constraints.** Our UI looks nothing like Material Design or Chakra defaults because we built it ourselves.

---

## 5. 🔥 Firebase — The Backend Trio

We use Firebase as a **serverless backend**, meaning zero backend infra to manage during the hackathon.

### 5a. Firestore — Real-Time Database

**Why Firestore over PostgreSQL / MongoDB?**

```
Traditional REST API:          GenSathi with Firestore:
  User submits complaint          User submits complaint
        ↓                               ↓
  POST /api/complaint              addDoc() in Firestore
        ↓                               ↓
  Server validates                 Admin's screen updates
        ↓                           IN REAL TIME — no polling,
  DB insert                        no websocket setup,
        ↓                           no backend server needed
  Admin refreshes manually
```

**Firestore `onSnapshot`** = zero-latency live sync between citizen actions and admin dashboard. When a citizen files a complaint, the admin map pin appears **instantly**.

**Key Firestore patterns we used:**
| Pattern | Why |
|---|---|
| `serverTimestamp()` | Timestamps come from Firebase servers — can't be spoofed by client |
| `increment()` | Atomic XP and upvote counters — no race conditions |
| `runTransaction()` | Upvote toggle is read-then-write — transaction prevents double-counting |
| `arrayUnion / arrayRemove` | Track who upvoted without duplicates |
| Geohash field | Every complaint stores a spatial hash for future proximity queries |

### 5b. Firebase Auth — Authentication

**Why Firebase Auth over building our own?**

- Google OAuth in 3 lines of code — users trust Google login
- Email/Password as fallback for users without Google accounts
- Session persistence across browser refreshes, zero cookie management
- `onAuthStateChanged` listener integrates cleanly with our `useAuth` hook

**Admin role system:** We check the logged-in email against a hardcoded `ADMIN_EMAILS` array — perfect for hackathon scale, trivially upgradeable to Firestore role documents later.

### 5c. Firebase Storage — Image Storage

Every complaint requires a photo. Every admin status update requires a proof photo. Every resolution requires before + after photos.

Firebase Storage gives us:
- Secure, authenticated file uploads directly from the browser
- CDN-delivered images globally
- Path-based organisation: `complaints/{id}/before`, `complaints/{id}/after`

---

## 6. 🗺️ Leaflet + react-leaflet — Maps

**Why Leaflet over Google Maps?**

| Factor | Google Maps | Leaflet + OpenStreetMap |
|---|---|---|
| Cost | $7 per 1000 loads | **Free** |
| API key billing | Yes — per request | No |
| Offline tiles | No | Yes (self-host possible) |
| Bundle size | Heavy SDK | Lightweight library |
| Customisation | Limited | Full control |

For a hackathon civic app, **free and flexible** beats paid and restricted.

**Technical challenge we solved:**  
Leaflet relies on `document.appendChild` — it crashes under Next.js SSR. Our solution:
1. Import map components via `next/dynamic({ ssr: false })`
2. Add a `mounted` guard inside `SingleLocationMap` with `useEffect`
3. Show a pulsing placeholder until the DOM is ready

This is the **correct, production-grade pattern** for Leaflet in Next.js.

### ngeohash — Spatial Indexing

Every complaint stores a **geohash** (a string encoding of lat/lng). This enables:
- Bounding-box queries on Firestore (find complaints in an area)
- Foundation for future **heatmap clustering**
- Our **duplicate detection** uses Haversine formula on raw lat/lng for precision

---

## 7. 🛡️ Zod — Validation

**Why Zod?**

Before any complaint reaches Firestore, Zod schemas validate:
- File type is `image/jpeg` or `image/png`
- Title is between 5–100 characters
- Description doesn't exceed limits

Zod's `.parse()` either returns fully-typed data or throws a descriptive error — no manual `if (!field)` chains.

---

## 8. 📅 date-fns — Date Formatting

**Why date-fns over moment.js?**

- **Tree-shakeable** — we import only `formatDistanceToNow`, not the entire 67kb moment bundle
- Pure functions — no mutation, no side effects
- Works perfectly with Firestore `Timestamp.toDate()`

We added null guards: `timeAgo(null)` returns `"just now"` gracefully, handling the window between `addDoc()` and Firestore's `serverTimestamp()` resolving.

---

## 9. 🎮 Custom Gamification Engine

**We didn't use any gamification library.** We built it ourselves in ~60 lines (`lib/gamification/xpEngine.ts`):

```typescript
XP_REWARDS = {
  SUBMIT_COMPLAINT:    +10,
  COMPLAINT_VERIFIED:  +15,
  COMPLAINT_RESOLVED:  +30,
  GIVE_UPVOTE:         +1,
  RECEIVE_UPVOTE:      +2,
  COMPLAINT_REJECTED:  -5,
}
```

**Key design decision:** Admins are explicitly excluded from XP gain. When an admin accepts a complaint, XP goes to the citizen — never the admin. This prevents role conflicts and keeps the leaderboard meaningful.

**Level calculation** uses threshold arrays — O(n) lookup, simple to extend:
```typescript
const LEVEL_THRESHOLDS = [0, 50, 150, 350, 600, 1000, 1500];
```

---

## 10. 🔍 Duplicate Detection — Built Without ML

**The problem:** Two people file complaints for the same pothole.  
**The naive solution:** Image similarity detection (expensive, requires ML).  
**Our solution:** Haversine distance formula.

```typescript
// If any open complaint exists within 150 metres → show warning modal
haversineMetres(lat1, lng1, lat2, lng2) < 150
```

- Zero ML infrastructure
- Works even when photos are completely different
- Shows the citizen the existing complaint with a preview
- Gives them a choice: upvote it, or file anyway

This is **better than image hashing** because the same problem filmed from two angles with two different phones produces two different image hashes — but the GPS coordinates will be nearly identical.

---

## 11. 📍 Manual Location Input — Forward Geocoding

**The problem:** Some users deny GPS access.  
**Our solution:** Nominatim (OpenStreetMap's geocoding API) for both directions:

```
Reverse geocoding:  lat/lng → "MG Road, Bengaluru"
Forward geocoding:  "MG Road" → lat: 12.9716, lng: 77.5946
```

Debounced search input (600ms) → dropdown of 5 suggestions → map pin updates live.  
**Cost: Free.** Nominatim is a public OpenStreetMap service.

---

## 🏆 Why This Stack Wins

| Criterion | Our Choice | Result |
|---|---|---|
| **Speed to build** | Next.js + Firebase | Full app in hackathon timeframe |
| **Real-time** | Firestore `onSnapshot` | Zero-latency updates |
| **Cost at scale** | Firebase free tier + OSM | $0 infra cost for demo |
| **Type safety** | TypeScript everywhere | Runtime errors caught at compile time |
| **Map cost** | Leaflet + OpenStreetMap | $0 vs Google Maps $7/1000 loads |
| **Auth complexity** | Firebase Auth | OAuth in 3 lines |
| **No backend server** | Firebase serverless | Zero DevOps, zero downtime |
| **Design quality** | Custom Tailwind system | Unique glassmorphism UI |

---

## 📈 Scalability Path

The current stack scales to production with minimal changes:

```
NOW (Hackathon)              →    PRODUCTION
─────────────────────────────────────────────
Firebase free tier           →    Firebase Blaze (pay-as-you-go)
ADMIN_EMAILS array           →    Firestore roles collection
Nominatim geocoding          →    Self-hosted Nominatim or Mapbox
Haversine duplicate check    →    Geohash bounding-box query
Client-side image upload     →    Server-side validation + compression
Manual push notifications    →    Firebase Cloud Messaging (FCM)
```

**The architecture doesn't change.** Only the scale of individual services does.

---

## 🔐 Security Highlights

| Layer | Protection |
|---|---|
| Firestore Rules | Users can only write their own documents |
| Storage Rules | Authenticated users only; file size limits |
| Admin routes | Checked via `userData.role !== 'admin'` redirect |
| XP system | Admins explicitly excluded from XP gain |
| Timestamps | `serverTimestamp()` — client cannot fake submission time |
| Image uploads | Required for every status change — prevents fake resolutions |

---

*GenSathi — Built for Webathon 2026*  
*Stack chosen for speed, reliability, and zero infrastructure cost*
