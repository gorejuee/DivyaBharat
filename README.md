# DivyaBharat

An AI-powered Indian spiritual and heritage travel companion. DivyaBharat helps travelers discover temples, forts, caves, ghats, ashrams and other heritage sites across India with rich historical context powered by AI.

---

## Features

- Explore Places - Browse and search heritage sites across India with category and state filters
- Interactive Map - View all places as color-coded pins on a live map with category filtering
- AI Guide - Ask anything about a place and get knowledgeable answers powered by Groq and Llama 3.3
- Smart Caching - AI responses are cached in the database so repeated questions return instantly
- Place Submission - Logged-in users can submit new heritage places for admin review
- Admin Panel - Admins can approve or reject submitted places before they go live
- Visited Places - Mark places as visited and track them on your personal profile page
- Authentication - Register and login with email/password or Google account, session persists across refreshes
- Role System - User and admin roles with protected routes and server-side middleware

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Vue 3 + Vite | Frontend framework |
| Vuetify 3 | UI component library |
| Pinia | State management with persistence |
| Vue Router | Client-side routing with navigation guards |
| Axios | HTTP client with request and response interceptors |
| Leaflet | Interactive map with custom category markers |
| Lodash | Debounce on search inputs |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL | Primary database |
| Sequelize ORM | Database models and queries |
| Sequelize CLI | Migrations and seeders |
| JWT + bcryptjs | Authentication and password hashing |
| Passport + Google OAuth 2.0 | Google login |
| Groq SDK | AI guide using llama-3.3-70b-versatile |
| module-alias | Clean path aliases (@server) |
| crypto | MD5 hashing for AI response cache keys |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker + docker-compose | Containerized backend and database |
| OpenStreetMap + Nominatim | Free geocoding for place submission map picker |

---

## Project Structure

```
DivyaBharat/
├── docker-compose.yml
├── divyabharat-frontend/
│   └── src/
│       ├── views/
│       ├── components/
│       ├── router/
│       ├── stores/
│       ├── services/
│       └── utils/
│
└── divyabharat-backend/
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── migrations/
    ├── models/
    ├── routes/
    ├── seeders/
    ├── db.js
    └── server.js
```

---

## Database Schema

### users

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | STRING | Required |
| email | STRING | Unique |
| password | STRING | Nullable for Google OAuth users |
| role | ENUM | user, admin - default is user |
| google_id | STRING | Nullable, populated on Google login |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

### places

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | STRING | Required |
| description | TEXT | - |
| history | TEXT | - |
| category | ENUM | temple, fort, cave, ghat, ashram, gurudwara, sacred_river, ancient_site, heritage_village, museum, natural_sacred, other |
| state | STRING | Required |
| city | STRING | - |
| latitude | DECIMAL(10,8) | Float getter applied |
| longitude | DECIMAL(11,8) | Float getter applied |
| image_url | STRING | - |
| status | ENUM | pending, approved, rejected - default is pending |
| submitted_by | UUID | FK to users.id |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

Places use a default scope that filters to approved status only. Admin queries use Place.unscoped() to bypass this.

### ai_guide_cache

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| place_id | UUID | FK to places.id, cascades on delete |
| question_hash | STRING(32) | MD5 hash of normalized question |
| question | TEXT | Original question text |
| answer | TEXT | AI response |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

Unique index on (place_id, question_hash) prevents duplicate cache entries.

### user_places

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK to users.id, cascades on delete |
| place_id | UUID | FK to places.id, cascades on delete |
| visited_at | DATE | Auto |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

Unique index on (user_id, place_id) prevents duplicate entries.

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register with email and password |
| POST | /api/auth/login | Public | Login and receive JWT token |
| GET | /api/auth/me | Protected | Get current user info |
| GET | /api/auth/google | Public | Initiate Google OAuth login |
| GET | /api/auth/google/callback | Public | Google OAuth callback |

### Places

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/places | Public | Get approved places, supports ?search, ?category, ?state |
| GET | /api/places/:id | Public | Get single place by ID |
| POST | /api/places/submit | Protected | Submit a new place for review |
| GET | /api/places/admin/pending | Admin | Get all pending submissions |
| PATCH | /api/places/:id/review | Admin | Approve or reject a submission |

### Visits

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/visits | Protected | Mark a place as visited |
| DELETE | /api/visits/:placeId | Protected | Unmark a visited place |
| GET | /api/visits | Protected | Get all visited places with details |
| GET | /api/visits/ids | Protected | Get visited place IDs only |

### AI Guide

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/ai/ask | Protected | Ask the AI guide about a place |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+ (for local development)
- Docker and docker-compose (for containerized setup)
- Groq API key - free at console.groq.com
- Google OAuth credentials - from console.cloud.google.com

---

### Option 1 - Local Development

**1. Clone the repository**

```
git clone https://github.com/gorejuee/DivyaBharat.git
cd DivyaBharat
```

**2. Setup the backend**

```
cd divyabharat-backend
npm install
```

Create a `.env` file inside `divyabharat-backend/`:

```
PORT=3000
DB_NAME=divyabharat_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

Create the database:

```
CREATE DATABASE divyabharat_db;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE divyabharat_db TO your_db_user;
```

Run migrations and seed data:

```
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Start the backend:

```
npm run dev
```

**3. Setup the frontend**

Open a new terminal:

```
cd divyabharat-frontend
npm install
npm run dev
```

App runs at http://localhost:5173, backend at http://localhost:3000

---

### Option 2 - Docker

Docker handles the backend and database together. You still run the frontend locally.

**1. Clone the repository**

```
git clone https://github.com/gorejuee/DivyaBharat.git
cd DivyaBharat
```

**2. Create a `.env` file in the root `DivyaBharat/` folder**

```
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**3. Start the backend and database**

```
docker-compose up --build
```

**4. Run migrations and seed data**

```
docker exec -it divyabharat_backend npx sequelize-cli db:migrate
docker exec -it divyabharat_backend npx sequelize-cli db:seed:all
```

**5. Start the frontend**

```
cd divyabharat-frontend
npm install
npm run dev
```

App runs at http://localhost:5173

To stop:

```
docker-compose down
```

---

## Roadmap

### Done

- Project setup and folder structure
- JWT authentication and Google OAuth login
- User role system with admin and user roles
- Sequelize migrations with UUID primary keys
- Places database with real seeded heritage sites
- Places listing with search and filters
- Interactive map view with Leaflet and color-coded pins
- Place detail page with AI guide chat
- AI response caching in database
- Place submission by logged-in users
- Admin panel to approve and reject submissions
- Visited places tracking with personal profile page
- Docker and docker-compose setup
- Navbar with auth state, role-based links, and route guards

### Planned

- PostGIS for location-based nearby place discovery
- Trip planner with itinerary builder
- Personal travel journal
- Dashboard with widgets
- Deployment on Render, Vercel, and Supabase

---

## Author

Built by Juee Gore.

---

## License

MIT