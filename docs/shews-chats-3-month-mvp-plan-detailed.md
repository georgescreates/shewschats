# 📌 Shews Chats – Expanded 3-Month MVP Plan (Chats, Calls, Ratings, Earnings)

**Start Date:** 2025-04-23  
**Duration:** 3 Months  
**Focus:** Auth, 1:1 Messaging, Calls, Session Management, Ratings & Earnings  
**Excluded:** Game Section

---

## 🔹 Phase 1: Foundations & Authentication (Week 1–2)

### Goals:
- Set up the project environment, base UI, and authentication system.

### Actionable Tasks:
- [ ] **UI Setup**:
  - Finalize HTML structure using `index.html`
  - Implement Tailwind utility classes and custom CSS from `input.css`
  - Ensure proper section visibility switching using `toggleSections.js`

- [ ] **Firebase Setup**:
  - Create Firebase project, enable Auth, Firestore, and Storage
  - Set up `.env` variables and connect via `firebaseConfig.js`

- [ ] **User Authentication**:
  - Enable Email/Password and Google Sign-In
  - Add sign-in/sign-out logic in `firebaseAuth.js`
  - On login success, call `authState.js` to toggle between:
    - Login screen (`#auth-empty-screen`)
    - Dashboard/profile (`#auth-fulfilled-screen`)
  - Store user info (role, ID, timestamp) in Firestore using `userData.js`

---

## 🔹 Phase 2: Core Messaging & Sessions (Week 3–5)

### Goals:
- Enable real-time messaging and build a request-based session system.

### Actionable Tasks:
- [ ] **Session Architecture**:
  - Define Firestore collections: `sessions`, `messages`
  - Session doc structure: { sessionID, stemID, shewID, status, startTime, endTime }
  - Implement `dbActions.js` to create and update sessions

- [ ] **Request Flow**:
  - STEM requests session by entering `shewID`
  - SHEW sees request with option to Accept / Schedule / Decline

- [ ] **Live Messaging**:
  - Use Firestore `onSnapshot()` to stream chat messages in real time
  - Create input handler in `listeners.js` and chat renderer in `updateUI.js`

- [ ] **Voice Notes**:
  - Integrate file input + Firebase Storage for voice note uploads
  - Store metadata in `messages` collection

- [ ] **Session Timer**:
  - Add countdown logic on accept (1 hour)
  - Trigger session end actions in `triggers.js`

---

## 🔹 Phase 3: Calls + Media Sharing (Week 6–7)

### Goals:
- Add audio call functionality and media content sharing with partial access.

### Actionable Tasks:
- [ ] **WebRTC Audio**:
  - Use simple peer/WebRTC for 1:1 audio
  - Initiate via call button → handle in `calls-section`

- [ ] **Image/Video Uploads**:
  - Drag/drop or file picker for uploads
  - Store in Firebase Storage
  - Display preview with "unlock to reveal" interface

- [ ] **Partial Media Reveal**:
  - Implement lock overlay until STEM pays/tips
  - Save unlock state per media item

---

## 🔹 Phase 4: Ratings & Earnings (Week 8–10)

### Goals:
- Introduce post-session evaluation and earning system for SHEWs.

### Actionable Tasks:
- [ ] **Rating Submission**:
  - Both users rate each other after session ends
  - Use slider or emoji scale in UI
  - Save to Firestore in `ratings` subcollection

- [ ] **LLM Evaluation (Basic)**:
  - (Optional) Send session transcript to LLM (API or mock)
  - Return `friendliness`, `openness`, `promptness` scores

- [ ] **Earnings Logic**:
  - Calculate SHEW earnings:
    - Flat rate
    - Adaptive (based on messages, voice notes, media unlocks)
    - Tips (optional)
  - Show in `earnings-section` with user stats

---

## 🔹 Phase 5: Final Polish & Launch Prep (Week 11–12)

### Goals:
- Refine UX, fix bugs, and prep for initial release.

### Actionable Tasks:
- [ ] **Notification UI**:
  - Toasts for session requests, tips, ratings
  - Real-time hooks into Firestore

- [ ] **Mobile Optimization**:
  - Test all views for mobile
  - Adjust Tailwind classes accordingly

- [ ] **Deployment**:
  - Choose between Firebase Hosting, Vercel, or VPS
  - Create onboarding modal, privacy terms, session policies
  - Deploy publicly or to testers

---

## ✅ Scope Omitted:
- Game Store
- LLM-powered advanced analysis
- Advanced billing model or admin dashboard

---

## 🎯 MVP Outcome
A responsive, Firebase-connected chat+call platform with session-based interactions, real-time features, rating systems, and earnings logic — designed to scale into more intelligent or gamified features over time.