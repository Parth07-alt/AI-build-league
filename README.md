# AI Build League

A fully functional growth loop prototype built for the NxtWave Growth Intern Challenge.

## Project Structure

This is a monorepo consisting of:
- `client/`: React + Vite + Tailwind CSS frontend
- `server/`: Node + Express + SQLite backend

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Getting Started

### 1. Backend Setup

```bash
cd server
npm install

# The database is pre-seeded via seed.js
# If you need to re-seed:
npm run seed

# Start the server
npm run start
```
The server will run on `http://localhost:3001`.

### 2. Frontend Setup

In a new terminal window:
```bash
cd client
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

## Features

- **Landing Page:** Animated counters, live leaderboard preview, and project selection.
- **Registration Flow:** Multi-step wizard allowing users to select projects, campuses, and provide referral codes.
- **Student Dashboard:** Personalized portal showing individual stats, campus rank, and referral sharing tools (WhatsApp integration).
- **Project Passport:** A shareable digital certificate optimized for LinkedIn showcasing the student's built project.
- **Project Wall:** A gallery of completed projects with voting and filtering capabilities.
- **Campus & Club Leaderboards:** Live ranking based on the Growth Score formula (Registrations, Attendance, Completions, Referrals).
- **Club Dashboard:** A portal for student clubs to track their performance and generate customized Campaign Kits.
- **Admin Dashboard:** Comprehensive metrics tracking the growth funnel, budget allocation, campus/club performance, and ongoing experiments.

## Growth Loop Architecture

1. **Acquisition:** Clubs use generated Campaign Kits to distribute referral links.
2. **Activation:** Students register, selecting a project and campus, generating their own referral code.
3. **Engagement:** Students attend the 60-minute workshop and complete their chosen AI project.
4. **Retention/Referral:** Students receive a "Project Passport" to share on LinkedIn/WhatsApp, driving new acquisitions back into the loop. 
5. **Gamification:** All activities increase the "Growth Score", driving competition between campuses and clubs.

## Tech Stack

- **Frontend:** React (TypeScript), Vite, Tailwind CSS, React Router, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, better-sqlite3 (SQLite database).
