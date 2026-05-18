# DivyaBharat

An AI-powered Indian spiritual and heritage travel companion. DivyaBharat helps travelers discover temples, forts, caves, ghats, ashrams and other heritage sites across India with rich historical context powered by AI.

---

## Features

- Explore Places - Browse and search 6000+ real heritage sites across India with category, region, and search filters
- Interactive Map - View all places on a live map of India with category filtering and marker clustering
- AI Guide - Ask anything about a place and get knowledgeable answers powered by Groq and Llama 3.3, enriched with Wikipedia context
- Smart Caching - AI responses are cached in the database so repeated questions return instantly
- Place Submission - Logged-in users can submit new heritage places with a map picker for coordinates
- Admin Panel - Admins can approve or reject submissions and trigger Wikidata imports
- Visited Places - Mark places as visited and track them on your personal profile page
- Authentication - Register and login with email/password or Google account, session persists across refreshes
- Role System - User and admin roles with protected routes and server-side middleware
- Wikidata Sync - Automated daily import of Indian heritage sites from Wikidata with deduplication

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Vue 3 + Vite | Frontend framework |
| Vuetify 3 | UI component library with custom warm theme |
| Pinia | State management with persistence |
| Vue Router | Client-side routing with navigation guards |
| Axios | HTTP client with request and response interceptors |
| Leaflet + MarkerCluster | Interactive map with clustering for large datasets |
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
| node-cron | Daily Wikidata sync job at 2 AM IST |
| axios | HTTP client for Wikidata SPARQL and Wikipedia APIs |
| module-alias | Clean path aliases (@server) |
| crypto | MD5 hashing for AI response cache keys |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker + docker-compose | Containerized backend and database |
| OpenStreetMap + Nominatim | Free geocoding for place submission map picker |
| Wikidata SPARQL API | Source of Indian heritage place data |
| Wikipedia REST API | Contextual summaries for AI guide |

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
├── jobs/
├── middlewares/
├── migrations/
├── models/
├── routes/
├── seeders/
├── services/
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
| image_url | STRING | Wikimedia Commons thumbnail URL where available |
| status | ENUM | pending, approved, rejected - default is pending |
| submitted_by | UUID | FK to users.id |
| wikidata_id | STRING | Unique, populated for Wikidata-sourced places |
| source | ENUM | wikidata, community - default is community |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

Places use a default scope that filters to approved status only. Admin queries use Place.unscoped() to bypass this. Community submissions are never overwritten by Wikidata sync.

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
| GET | /api/places | Public | Get approved places with pagination, search, category, state filters |
| GET | /api/places/featured | Public | Get 3 random featured places for homepage |
| GET | /api/places/states | Public | Get all regions with place counts |
| GET | /api/places/:id | Public | Get single place by ID |
| GET | /api/places/:id/context | Public | Get place with capitalized description and Wikipedia extract |
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

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/admin/import-wikidata | Admin | Trigger manual Wikidata import |

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

```
cd divyabharat-frontend
npm install
npm run dev
```

App runs at http://localhost:5173, backend at http://localhost:3000

**4. Import heritage places (requires internet access, run on first setup)**

Login as admin and click "Import from Wikidata" in the admin panel, or:

```
curl -X POST http://localhost:3000/api/admin/import-wikidata \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

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

- Project setup, folder structure, and CI conventions
- JWT authentication and Google OAuth login
- User role system with admin and user roles
- Sequelize migrations with UUID primary keys
- Place submission with Leaflet map picker and Nominatim geocoding
- Admin panel to approve and reject submissions
- Wikidata integration - 5000+ Indian heritage places with daily sync
- Wikipedia RAG context enriching AI guide responses
- Places listing with search, category, pagination, and region filter
- Interactive map with marker clustering showing all places
- Place detail page with AI guide chat, mini map, and Wikipedia extract
- AI response caching in database
- Visited places tracking with personal profile page
- Docker and docker-compose setup
- Full UI overhaul - warm saffron theme, Playfair Display typography, 3D card effects

### Planned

- Trip planner with AI-generated itineraries and shareable links
- Personal travel journal
- Deployment on Render, Vercel, and Supabase

---

## Author

Built by Juee Gore.

---

## License

MIT