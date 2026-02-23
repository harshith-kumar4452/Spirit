# GenSathi — Pitch Document
### *Bridging Citizens & City Administration Through Real-Time Civic Engagement*

---

## 🎯 The Problem

Every day, millions of citizens walk past broken roads, overflowing garbage bins, damaged streetlights, and water leakages — and do nothing. Not because they don't care, but because **they don't know how, and they don't believe anything will happen.**

Currently, the civic complaint process looks like this:

```
Citizen notices a problem
        ↓
Searches for a phone number or office
        ↓
Calls, waits on hold, or visits in person
        ↓
Complaint logged manually (or not at all)
        ↓
No updates, no transparency, no accountability
        ↓
Problem remains unsolved for weeks or months
```

**The result?**
- Citizens lose faith in local governance
- Duplicate complaints flood the system
- Admins have no prioritization framework
- Issues that affect hundreds go unresolved because just one person reported it

---

## 💡 Our Solution — GenSathi

**GenSathi** is a real-time, gamified civic complaint management platform that connects citizens directly to city administrators — with full transparency, proof-based resolution, and community engagement built in.

> *"Report it. Track it. See it change."*

---

## 👥 Who Uses It

### 🧑‍💼 Citizens
Any resident using their smartphone or computer to:
- Report local problems with photo evidence
- Upvote complaints filed by neighbours
- Track the real-time status of their complaint
- Earn XP points and level up as an active civic member

### 🛡️ Administrators
City department staff using the admin panel to:
- See all complaints live on an interactive map
- Accept, reject, or prioritize reported issues
- Upload proof images when updating status
- Upload Before & After photos when resolving a complaint
- View analytics and track resolution performance

---

## 🔄 End-to-End Workflow

### PHASE 1 — DISCOVERY (Citizen)

```
1. Citizen opens GenSathi
2. Lands on the cinematic homepage showing a live map
   of all pinned complaints in the city
3. Sees existing issues near them on the map
```

> **Decision point:** Is this issue already reported?
> - ✅ YES → Upvote it to boost its priority (and earn XP)
> - ❌ NO → File a new complaint

---

### PHASE 2 — REPORTING (Citizen)

```
4. Citizen clicks "File a Complaint"
5. Fills out the complaint form:
   ├── 📷 Uploads a photo (required proof)
   ├── 📍 Selects location (GPS auto-detect or manual pin)
   ├── 🏷️ Picks a category (Road, Water, Electricity, etc.)
   ├── 📝 Writes a title and description
   └── 🚨 Sets a priority level (Low / Medium / High / Critical)
6. Submits the complaint
7. Complaint is saved to Firestore with:
   ├── Geohash for spatial indexing
   ├── Status: "Submitted"
   └── ServerTimestamp for ordering
8. Citizen earns +10 XP immediately
9. Complaint pin appears live on the map for all to see
```

---

### PHASE 3 — COMMUNITY VALIDATION (Citizens)

```
10. Other citizens in the area see the complaint on the map
11. They upvote it if they're affected too
    ├── Voter earns +1 XP
    └── Complaint owner earns +2 XP per upvote
12. High-upvote complaints rise in visibility
13. Admin sees complaints sorted by upvotes + priority
```

> **Why this matters:** Community upvoting acts as a **democratic prioritization engine** — issues affecting the most people get addressed first, not randomly.

---

### PHASE 4 — ADMIN TRIAGE (Administrator)

```
14. Admin logs in → lands on Admin Command Center
    ├── LEFT: Full-screen live map with all complaint pins
    │         Color-coded by status (pending/in-progress/resolved)
    └── RIGHT: Action panel with live stats
              Total / Pending / Resolved / Rejected counts

15. Admin clicks "View Complaints"
16. Opens the complaint card grid:
    ├── Filters: All / Pending / Resolved
    ├── Search: by title or location area
    └── Each card shows:
        ├── Hero image with priority badge
        ├── Category + Status badges
        ├── Location + Time
        ├── Community upvote count
        └── Action buttons: Details / Accept / Reject

17. For new (Submitted) complaints:
    ├── ACCEPT → Status moves to "Under Review"
    │   └── Citizen earns +15 XP
    └── REJECT → Status moves to "Rejected"
        └── Citizen loses 5 XP (discourages spam)
```

---

### PHASE 5 — INVESTIGATION & PROGRESS (Administrator)

```
18. Admin opens full complaint detail page
19. Sees: Full image, description, exact map location,
    upvote count, reporter info, activity history

20. Admin updates the status to "In Progress"
    ├── REQUIRED: Must upload a proof/update image
    │   (e.g., photo of crew arriving at site)
    └── Can add internal notes

21. Firestore activity log records:
    ├── Who changed the status
    ├── What it changed from → to
    ├── Timestamp
    └── Proof image URL in notes
```

---

### PHASE 6 — RESOLUTION WITH PROOF (Administrator)

```
22. Work is completed on the ground
23. Admin marks complaint as "Resolved"
24. REQUIRED UPLOADS (enforced in UI):
    ├── 📸 BEFORE REPAIR photo
    │   (original problem — can be same as submitted photo)
    └── 📸 AFTER REPAIR photo
        (showing the fix is complete)

25. Both images uploaded to Firebase Storage
26. URLs saved in the activity log
27. Complaint status → "Resolved"
28. Citizen earns +30 XP
29. Admin's resolution rate % updates on dashboard
```

> **Why proof images are mandatory for resolution:**
> This prevents fake resolutions. Citizens and auditors can see the actual before/after comparison — complete accountability.

---

### PHASE 7 — CITIZEN FEEDBACK LOOP (Citizen)

```
30. Citizen receives status update (real-time via Firestore listener)
31. Opens the complaint detail page
32. Sees the full activity timeline:
    ├── ✅ Submitted → Under Review → In Progress → Resolved
    ├── Each step shows: who acted, when, and any notes
    └── Before/After images visible in the activity log

33. Citizen's XP and level updated on their profile
34. If level threshold crossed → level title promoted
    (e.g., "Citizen" → "Active Citizen")
```

---

### PHASE 8 — ANALYTICS & GOVERNANCE (Administrator)

```
35. Admin visits the Dashboard page
36. Views live analytics:
    ├── 📊 Resolution Rate (% of total complaints resolved)
    ├── 📈 Status Breakdown bar chart
    │   (Submitted / Under Review / In Progress / Resolved / Rejected)
    ├── 🏷️ Top Categories (which issues are most common)
    ├── 🕓 Recent Complaints feed
    └── ❤️ Total community upvotes (engagement metric)

37. Data updates in real-time — no page refresh needed
38. Helps city planners identify:
    ├── Which areas have the most problems
    ├── Which departments are slowest to resolve
    └── Which issue types recur frequently
```

---

## 🎮 Gamification System — Why It Works

| Action | XP Gained |
|---|---|
| Submit a complaint | +10 |
| Complaint accepted/verified | +15 |
| Complaint resolved | +30 |
| Complaint rejected (spam penalty) | −5 |
| Give an upvote | +1 |
| Receive an upvote | +2 |

| Level | Title | XP Needed |
|---|---|---|
| 1 | Newcomer | 0 |
| 2 | Citizen | 50 |
| 3 | Active Citizen | 150 |
| 4 | Community Voice | 350 |
| 5 | Civic Champion | 600 |
| 6 | Neighbourhood Guardian | 1000 |
| 7 | City Hero | 1500 |

**The result:** Citizens are incentivized to report real issues, engage with their community, and stay invested in outcomes — turning passive observers into active civic participants.

---

## 🛡️ Accountability Mechanisms

| Feature | How It Creates Accountability |
|---|---|
| Mandatory proof image on status change | Admins can't mark something "In Progress" without visual evidence |
| Before + After photos on resolution | Citizens can verify the fix actually happened |
| Activity log per complaint | Full audit trail of who did what and when |
| Community upvotes | Democratic prioritization — high-impact issues can't be ignored |
| Real-time status updates | Citizens know exactly where their complaint stands |
| XP penalty for rejected complaints | Discourages false or spam reports |
| Admin XP protection | Admins never earn citizen XP — no conflict of interest |

---

## 🗺️ Live Map — The Heartbeat of GenSathi

The map is central to everything:

- **Citizens** see what problems exist near them → engage with existing complaints before filing duplicates
- **Admins** see a geographic heat map of problems → can dispatch teams spatially
- **Decision makers** can identify problem clusters → allocate resources by area
- **Real-time pins** update as complaints are filed, accepted, and resolved

---

## 🚀 Technology Highlights

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (React 19, App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom glassmorphism design system |
| Database | Firebase Firestore (real-time NoSQL) |
| Auth | Firebase Auth (Google OAuth + Email/Password) |
| Storage | Firebase Storage (complaint + resolution photos) |
| Maps | Leaflet + react-leaflet + OpenStreetMap |
| Geolocation | ngeohash (spatial indexing) |
| Validation | Zod |
| Date Utilities | date-fns |
| Icons | lucide-react |

---

## 📱 User Experience Highlights

- **Welcome splash video** plays on first login — cinematic onboarding
- **Glassmorphism UI** — premium dark-mode design throughout admin
- **Real-time updates** — no refresh needed anywhere; Firestore listeners push changes live
- **Mobile responsive** — floating action buttons on mobile for quick complaint submission
- **Post-login redirect** — admin → admin panel, citizen → dashboard, automatically
- **Incognito/extension-safe** — no dependency on browser extensions

---

## 📊 Impact Potential

| Metric | Traditional System | GenSathi |
|---|---|---|
| Time to file a complaint | 15–30 mins (phone/office visit) | < 2 minutes |
| Transparency | None | Full real-time status tracking |
| Community awareness | None | Visible map pins, upvotes |
| Resolution proof | Word of mouth | Mandatory before/after photos |
| Admin prioritization | FIFO or arbitrary | Upvote-weighted + priority tags |
| Citizen engagement | One-time reporters | Ongoing XP + level progression |
| Data for governance | Spreadsheets, if any | Live analytics dashboard |

---

## 🔮 Future Roadmap

1. **Push Notifications** — Alert citizens when their complaint status changes
2. **Department Routing** — Auto-assign complaints to the correct city department by category
3. **SLA Tracking** — Flag complaints that haven't been resolved within N days
4. **Heatmap Overlay** — Visual density map of problem clusters by area
5. **Citizen Verification** — Upvoting unlocks when complaint is resolved (verify fix in person)
6. **Public API** — Open data endpoint for journalists and urban researchers
7. **Multi-city Support** — Scale to multiple municipalities with isolated data

---

## 🏁 Summary

GenSathi is not just a complaint box — it is a **civic engagement platform** that:

✅ Makes reporting effortless (< 2 minutes, from anywhere)  
✅ Creates community consensus through upvoting  
✅ Forces accountability through mandatory proof images  
✅ Gives citizens full transparency via real-time tracking  
✅ Gives admins a command center with analytics and live maps  
✅ Gamifies participation to build long-term civic habits  
✅ Produces verifiable data for better urban governance  

> **GenSathi — Because every pothole deserves a paper trail, and every citizen deserves to be heard.**

---

*Document prepared for: Webathon Hackathon Pitch*  
*Team: GenSathi*  
*Date: February 21, 2026*
