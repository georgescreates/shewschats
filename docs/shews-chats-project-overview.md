# Shews Chats — Project Overview

## 💡 Concept Summary

Shews Chats is a 1:1 chat platform designed around emotional support and intentional communication between two roles:
- **STEM**: Supportive Tailored Empathy (currently seeking a better alternative to "mentee")
- **SHEW**: The counterpart to STEM, acting as the supporter

The structure takes inspiration from ride-sharing platforms. STEMs can initiate a session with a SHEW by using a unique `shewID`. SHEWs can accept, decline, or schedule sessions.

## 📱 Communication Features
- Text Chat
- Voice Notes
- Image & Video Sharing (with optional unlock/pay-as-you-view logic)
- 1:1 Calls

## ⏱️ Sessions
- Sessions are time-limited (1 hour)
- Can only begin after the SHEW accepts the request
- Metrics and interactions are recorded during each session

## 📊 Metrics & Stats
### Tracked for each session:
- **User Stats**: Friendliness, Promptness, Openness (via LLM post-analysis)
- **Rating System**:
  - Peer Rating (STEM ↔ SHEW)
  - LLM Rating
  - Combined into a final "session rating"

## 💸 Earnings
### For SHEWs:
- **Flat Rate** per session or
- **Adaptive Rate**:
  - Based on token count
  - Voice note duration
  - Media reveal progression (e.g., partial image/video unlock)
- **Tipping system**
- **App compensation**

### For STEMs:
- Charged per session
- Possible pay-per-action logic (media unlock, extended time)

## 🎮 Games Section
- Acts like a mini-store
- Users can browse and purchase interactive games
- Games can be added to live sessions and played collaboratively

## 🗂 JavaScript Structure

```
/js
│
├── main.js                  ← Entry point, loads on DOMContentLoaded
├── dom.js                   ← Centralized DOM element exports
│
├── events/
│   ├── listeners.js         ← Adds event listeners (clicks, forms)
│   └── triggers.js          ← Manual triggers (auto-refresh loops, etc.)
│
├── ui/
│   ├── toggleSections.js    ← Shows/hides sections
│   ├── updateUI.js          ← Updates visual content in DOM
│   └── animations.js        ← Visual effects, transitions
│
├── auth/
│   ├── firebaseAuth.js      ← Firebase auth handlers
│   └── authState.js         ← Updates UI according to auth state
│
├── data/
│   ├── firebaseConfig.js    ← Firebase config/init
│   ├── dbActions.js         ← Read/write to Firestore
│   └── userData.js          ← Profile, earnings, ratings
│
├── utils/
│   ├── validators.js        ← Form validation, ID checks
│   ├── formatters.js        ← Timestamp, token formatting
│   └── constants.js         ← Roles, durations, settings
```

---

This document reflects the current structure, logic vision, feature plan, and file strategy as discussed so far.