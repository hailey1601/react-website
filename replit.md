# Quiz Application - Replit Setup

## Overview
This is a full-stack quiz/assignment application built with React (frontend) and Express.js (backend) with SQLite database. The application allows users to take quizzes and administrators to manage quizzes and questions.

**Created:** November 24, 2025  
**Status:** Fully configured and running on Replit

## Project Architecture

### Frontend (React)
- **Location:** Root directory (`/`)
- **Port (Dev):** 5000
- **Framework:** Create React App (CRA)
- **Key Features:**
  - User authentication (login/register)
  - Quiz taking interface
  - Admin panel for quiz management
  - Results tracking
  - Chatbot component

### Backend (Express.js)
- **Location:** `/backend` directory
- **Port (Dev):** 8000
- **Port (Production):** 5000 (via PORT environment variable)
- **Database:** SQLite (`task_app.db`)
- **API Endpoints:**
  - `/api/login` - User authentication
  - `/api/register` - User registration
  - `/api/quizzes` - Quiz management
  - `/api/questions` - Question management
  - `/api/results` - Results tracking
  - `/api/my-results/:userId` - User-specific results
  - `/api/all-results` - All results (admin only)

## Configuration

### Environment Variables (Development)
- `PORT=5000` - Frontend server port
- `WDS_SOCKET_PORT=0` - WebSocket port for hot reload
- `DANGEROUSLY_DISABLE_HOST_CHECK=true` - Allow proxy through Replit's iframe

### Workflows
1. **Backend Server**
   - Command: `cd backend && npm start`
   - Port: 8000
   - Status: Running
   
2. **Frontend Server**
   - Command: `npm start`
   - Port: 5000
   - Output: Webview (user-facing)
   - Status: Running

### Deployment Configuration
- **Type:** Autoscale
- **Build:** `npm run build` (builds React app)
- **Run:** `cd backend && npm start` (serves built app + API)
- **Production Port:** 5000 (automatically set via PORT env var)

## Database Schema

### Tables:
1. **users** - User accounts (id, name, email, password, role)
2. **quizzes** - Quiz definitions (id, title, description, created_at)
3. **questions** - Quiz questions (id, quiz_id, question_text, options, correct_answer)
4. **results** - User quiz results (id, user_id, quiz_id, score, completed_at)

### Default Accounts:
- Admin: `admin@test.com` / `123456`
- User: `user@test.com` / `123456`

## Recent Changes

### November 24, 2025 - Initial Replit Setup
1. Installed all dependencies (frontend and backend)
2. Configured frontend to run on port 5000 with host bypass
3. Changed backend port from 5001 to 8000 (Replit requirement)
4. Updated proxy configuration in package.json
5. Fixed LoginPage.js to use relative API paths
6. Rebuilt sqlite3 native module for Replit environment
7. Configured workflows for both frontend and backend
8. Set up deployment with production build support
9. Updated backend to serve React build in production
10. Added environment variable PORT support for flexible deployment

## Development Notes

### Running Locally
- Frontend runs on port 5000 with React development server
- Backend runs on port 8000 with Express
- Frontend proxies API requests to backend via package.json proxy setting
- Both servers must be running for full functionality

### Production Deployment
- Frontend is built into `/build` directory
- Backend serves static files from build directory
- All routes go through single backend server on port 5000
- Database persists in `/backend/task_app.db`

## User Roles
- **Admin:** Can create, edit, and delete quizzes and questions; view all results
- **User:** Can take quizzes and view their own results

## Tech Stack
- **Frontend:** React 19, React Router DOM 7, Create React App 5
- **Backend:** Express 4, CORS, SQLite3
- **Database:** SQLite
- **Deployment:** Replit Autoscale

## File Structure
```
/
├── src/                    # React source files
│   ├── components/         # React components
│   │   ├── AdminPage.js
│   │   ├── ChatBot.js
│   │   ├── LoginPage.js
│   │   ├── QuizPage.js
│   │   ├── RegisterPage.js
│   │   ├── ResultsPage.js
│   │   └── UserHome.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── public/                 # Static files
├── backend/                # Backend server
│   ├── server.js          # Express server
│   ├── package.json
│   └── task_app.db        # SQLite database
├── package.json           # Frontend dependencies
└── replit.md             # This file
```
