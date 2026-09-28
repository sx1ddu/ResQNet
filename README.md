# ResQNet

A real-time emergency response platform built with the MERN stack.

ResQNet connects citizens, emergency control teams, rescue teams, hospitals, and shelters through a single platform. Citizens can report incidents, emergency teams can monitor and manage them, and facility information can be updated in real time.

The project focuses on building a practical emergency-response workflow with authentication, role-based access, live maps, real-time updates, AI-assisted incident analysis, and incident verification.

## Features

### Authentication and Access Control

- JWT-based authentication with access and refresh tokens
- Role-based access control
- Separate access for:
  - Citizen
  - Emergency Control Center
  - Rescue Team
  - Hospital
  - Shelter
- Protected frontend routes and backend authorization middleware

### Incident Reporting

- Citizens can submit SOS alerts and incident reports
- Reports include location, category, severity, description, and supporting information
- Incidents are displayed on an interactive Leaflet map
- OpenStreetMap is used for map data, so no paid map API key is required

### AI-Assisted Incident Analysis

- Incident descriptions can be analyzed using Google Gemini
- The AI service helps identify:
  - Incident category
  - Severity
  - Approximate number of affected people
  - Recommended response information
- A rule-based fallback is included so the application can still work when an external AI API is unavailable

### Duplicate Incident Detection

The backend checks whether a newly submitted report is likely to describe an existing incident.

The current approach combines:

- Geographic proximity
- Text similarity
- Jaccard similarity over incident text

This avoids requiring a separate vector database for the current project.

### Real-Time Updates

Socket.IO is used for real-time communication.

Dashboards can receive updates when:

- A new incident is reported
- An incident status changes
- A facility updates its capacity
- An emergency broadcast is created or removed
- Other operational information changes

This allows different users to see important updates without continuously polling the server.

### Emergency Control Center

The emergency control dashboard provides:

- Live incident map
- Incident list
- Incident severity and category
- Incident verification status
- Incident status management
- AI-generated incident summaries
- Resource recommendations
- Emergency broadcasts
- Facility and emergency contact information

Incident status can move through the response workflow:

`Reported → Acknowledged → Dispatched → In Progress → Resolved`

### Rescue Team Dashboard

Rescue teams can:

- View assigned incidents
- View available high-priority incidents
- Self-assign suitable incidents
- Track incident progress
- Receive real-time updates

### Hospital and Shelter Management

Facility users can register and manage their facility information.

The platform supports:

- Hospital registration
- Shelter registration
- Bed/capacity information
- Occupancy updates
- Facility contact information
- Real-time capacity updates on operational dashboards

### Incident Trust and Verification

The project includes a trust-score system for incident verification.

The score considers multiple signals:

- GPS consistency
- Crowd confirmation/dispute
- Authority verification
- AI confidence

Incidents can move through states such as:

`Pending → Suspicious → Verified → Highly Trusted`

Users can provide confirmation or dispute information, while authorized emergency personnel can verify or reject reports.

### Organization Verification

Organization accounts can provide verification documents during registration.

Emergency control users can review the submitted information and approve or reject the organization.

### Interactive Emergency Map

Incidents are represented on the map according to their category and risk level.

Examples include:

- Flood
- Fire
- Medical emergency
- Other emergency categories

Critical incidents can be highlighted on the map, while resolved or rejected incidents are visually de-emphasized.

### Emergency Broadcasts

The emergency control center can send a high-risk notification to connected users.

The notification appears in the application in real time and can be removed when the situation is no longer active.

### Emergency Contact Directory

The emergency control dashboard provides a centralized view of:

- Hospitals
- Shelters
- Rescue teams
- Other registered emergency organizations
- Contact information
- Current facility capacity

### Resource Recommendations

The system provides a response checklist for incidents.

The recommendations are generated using deterministic rules based on incident category and severity rather than allowing an LLM to invent operational quantities.

This keeps the response logic predictable and easier to validate.

### Assistant

A role-aware assistant is available from the application.

For citizens, it can provide basic emergency guidance and relevant shelter information.

For emergency control users, it can help search incidents using natural-language queries.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Server State | TanStack Query |
| Maps | Leaflet, React Leaflet, OpenStreetMap |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Real-Time Communication | Socket.IO |
| AI | Google Gemini with rule-based fallback |
| Deployment | Vercel, Render/Railway, MongoDB Atlas |

## Project Structure

```text
resqnet/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Incident.js
│   │   │   └── Facility.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── duplicateService.js
│   │   │   ├── socketService.js
│   │   │   └── trustScoreService.js
│   │   ├── seed/
│   │   │   └── demoSeed.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── IncidentMap.jsx
│   │   │   ├── IncidentCard.jsx
│   │   │   ├── SeverityBadge.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── EOCDashboard.jsx
│   │   │   ├── RescueDashboard.jsx
│   │   │   └── ReportIncident.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB or a MongoDB Atlas database
- Git

Google Gemini is optional because the project includes a fallback analysis mode.

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Configure the required environment variables.

For JWT secrets, generate secure random values. For example:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Demo Data

The project includes a seed script for creating sample users, facilities, and incidents.

Run:

```bash
cd backend
npm run seed
```

This creates a sample emergency scenario that can be used while testing the dashboards.

## Architecture

The application is divided into a React frontend and an Express backend.

```text
                 ┌─────────────────────┐
                 │      React App      │
                 │   Vite + Tailwind   │
                 └──────────┬──────────┘
                            │
                    REST API / Socket.IO
                            │
                 ┌──────────▼──────────┐
                 │   Express Server    │
                 │   Node.js Backend   │
                 └───────┬───────┬─────┘
                         │       │
                ┌────────▼──┐ ┌──▼────────────┐
                │  MongoDB  │ │ AI / Services │
                │  Mongoose │ │ Gemini + Rules │
                └───────────┘ └───────────────┘
```

### Authentication

The application uses short-lived JWT access tokens together with refresh tokens.

The frontend keeps the access token in memory and uses the refresh-token flow when a session needs to be renewed.

Protected routes on the backend verify the token and then check whether the user's role has permission to access the requested resource.

### Real-Time Communication

Socket.IO handles events that need to reach connected clients immediately.

Instead of implementing separate polling logic for every dashboard, the backend emits events whenever important operational data changes.

The frontend listens for those events and refreshes the relevant server-state queries.

### AI Service

AI processing is kept behind a service layer.

The application first attempts to use Gemini when it is configured. If the external service cannot be used, the backend falls back to deterministic rules.

This keeps AI functionality separate from the core incident workflow.

### Duplicate Detection

Duplicate detection is handled in two steps:

1. Find nearby incidents using MongoDB geospatial queries.
2. Compare the text of the reports using Jaccard similarity.

This keeps the implementation lightweight while still providing useful duplicate detection for short incident descriptions.

### Trust Score

The trust score is calculated from independent verification signals.

The calculation is kept in a separate service so that the score can be recalculated whenever a relevant signal changes.

The incident itself stores the verification information, making it possible to inspect the inputs that produced the current score.

### Resource Recommendation

Resource recommendations use a predefined rule table.

For example, incident category and severity can map to an appropriate response checklist.

This is intentionally kept deterministic because operational resource quantities should not depend entirely on an unconstrained language-model response.

## Development Notes

A few design decisions were made to keep the project manageable while leaving room for future expansion:

- A single `User` model is used with a role field instead of creating separate authentication systems for each role.
- Facility-specific information is stored separately from the main user document.
- MongoDB geospatial indexes are used for location-based incident queries.
- Socket.IO handles real-time operational updates.
- React Query manages server-side state on the frontend.
- AI functionality is isolated behind a service layer.
- Rule-based fallbacks are used for important functionality that should remain available without external APIs.
- The current duplicate detection does not require a vector database.
- Verification signals are stored with the incident and recalculated when they change.

## Future Improvements

The current version can be extended with:

- Dedicated police, fire, and municipal authority roles
- Volunteer and NGO dashboards
- Image-based incident verification
- Offline-first/PWA support
- Background job processing with Redis and BullMQ
- Local AI models through Ollama
- SMS emergency notifications
- Weather and GIS overlays
- Route optimization for rescue teams
- Additional disaster scenarios
- More advanced analytics and reporting

## What I Learned

This project helped me work with several areas of full-stack development:

- Designing REST APIs with Express
- Building role-based authentication and authorization
- Working with MongoDB geospatial queries
- Implementing real-time communication using Socket.IO
- Integrating an external AI service
- Designing fallback logic for external dependencies
- Building responsive dashboards with React
- Managing server state with TanStack Query
- Designing verification and trust workflows
- Structuring a MERN application into controllers, routes, services, and models

## Status

Initial version of ResQNet.

The main emergency reporting, monitoring, verification, real-time communication, and facility-management workflows are being developed as part of the first version.
