# 🛕 DivyaBharat

**An AI-powered Indian spiritual and heritage travel companion.**

DivyaBharat helps travelers discover temples, forts, caves, ghats, ashrams and other heritage sites across India — with rich historical context powered by AI.

---

## ✨ Features

- 🔍 **Explore Places** — Browse and search 15+ real heritage sites across India with category and state filters
- 🤖 **AI Guide** — Ask anything about a place and get warm, knowledgeable answers powered by Groq/Llama
- ⚡ **Smart Caching** — AI responses are cached in the database so repeated questions return instantly
- 🔐 **Authentication** — Register and login with JWT-based auth, session persists across page refreshes
- 🗺️ **Location Links** — Direct Google Maps integration for every place
- 📱 **Responsive UI** — Built with Vuetify 3 for a clean, modern experience

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Vue 3 + Vite | Frontend framework |
| Vuetify 3 | UI component library |
| Pinia | State management (persisted) |
| Vue Router | Client-side routing with guards |
| Axios | HTTP client with interceptors |
| Lodash | Debounce on search inputs |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL | Primary database |
| Sequelize ORM | Database models and queries |
| Sequelize CLI | Database migrations and seeders |
| JWT + bcryptjs | Authentication and password hashing |
| Groq SDK | AI guide (llama-3.3-70b-versatile) |
| module-alias | Clean path aliases (@server) |
| crypto (Node built-in) | MD5 hashing for AI response cache keys |

---

## 📁 Project Structure

```
DivyaBharat/
├── divyabharat-frontend/
│   └── src/
│       ├── views/           # Page components
│       ├── components/      # Reusable components
│       ├── router/          # Vue Router config and guards
│       ├── stores/          # Pinia stores
│       ├── services/        # Axios API service
│       └── utils/           # Shared helper functions
│
└── divyabharat-backend/
    ├── config/              # Database config
    ├── controllers/         # Request handlers
    ├── middlewares/         # Auth middleware
    ├── migrations/          # Sequelize CLI migrations
    ├── models/              # Sequelize models
    ├── routes/              # Express routes
    ├── seeders/             # Database seeders
    ├── db.js                # Model loader and associations
    └── server.js            # App entry point
```

---

## 🗄️ Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | STRING | Required |
| email | STRING | Unique |
| password | STRING | Bcrypt hashed |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

### places
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | STRING | Required |
| description | TEXT | — |
| history | TEXT | — |
| category | ENUM | temple, fort, cave, ghat, ashram, gurudwara, sacred_river, ancient_site, heritage_village, museum, natural_sacred, other |
| state | STRING | Required |
| city | STRING | — |
| latitude | DECIMAL(10,8) | Float getter applied |
| longitude | DECIMAL(11,8) | Float getter applied |
| image_url | STRING | — |
| status | ENUM | pending, approved, rejected |
| submitted_by | UUID | FK → users.id |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

> Places default scope filters to `status = approved` only. Use `Place.unscoped()` for admin queries.

### ai_guide_cache
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| place_id | UUID | FK → places.id (CASCADE) |
| question_hash | STRING(32) | MD5 hash of normalized question |
| question | TEXT | Original question text |
| answer | TEXT | AI response |
| created_at | DATE | Auto |
| updated_at | DATE | Auto |

> Unique index on `(place_id, question_hash)` prevents duplicate cache entries.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repository

```bash
git clone https://github.com/gorejuee/DivyaBharat.git
cd DivyaBharat
```

### 2. Setup Backend

```bash
cd divyabharat-backend
npm install
```

Create `.env` file:

```properties
PORT=3000
DB_NAME=divyabharat_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Create the database and run migrations:

```bash
npx sequelize db:migrate
npx sequelize db:seed:all
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Setup Frontend

```bash
cd divyabharat-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login and get JWT token |
| GET | /api/auth/me | Protected | Get current user |

### Places
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/places | Public | Get all approved places (supports ?search, ?category, ?state) |
| GET | /api/places/:id | Public | Get single place by ID |

### AI Guide
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/ai/ask | Protected | Ask AI guide about a place |

#### AI Ask Request Body
```json
{
  "placeId": "uuid-of-place",
  "question": "Who built this temple and when?"
}
```

#### AI Ask Response
```json
{
  "question": "Who built this temple and when?",
  "answer": "The temple was built by...",
  "place": { "id": "...", "name": "..." },
  "cached": false
}
```

---

## 🌱 Seeded Places

The following real heritage sites are included in the seed data:

| Place | Category | State |
|---|---|---|
| Kashi Vishwanath Temple | Temple | Uttar Pradesh |
| Dashashwamedh Ghat | Ghat | Uttar Pradesh |
| Ajanta Caves | Cave | Maharashtra |
| Ellora Caves | Cave | Maharashtra |
| Brihadeeswarar Temple | Temple | Tamil Nadu |
| Hampi | Ancient Site | Karnataka |
| Kedarnath Temple | Temple | Uttarakhand |
| Rishikesh | Ashram | Uttarakhand |
| Khajuraho Temples | Temple | Madhya Pradesh |
| Golden Temple | Gurudwara | Punjab |
| Meenakshi Amman Temple | Temple | Tamil Nadu |
| Chittorgarh Fort | Fort | Rajasthan |
| Gangotri | Sacred River | Uttarakhand |
| National Museum New Delhi | Museum | Delhi |
| Valley of Flowers | Natural Sacred | Uttarakhand |

---

## 🔧 Key Conventions

- All migrations use `queryInterface.createTable` — never `Model.sync`
- All `findOne` and `findAll` queries use explicit `attributes`
- All migrations wrapped in transactions
- `Place.unscoped()` used for admin queries to bypass defaultScope
- `@server` path alias configured via module-alias using `__dirname` (environment safe)
- `@/` maps to `src/` in frontend via Vite config
- `@update:modelValue` used on all clearable Vuetify fields
- Debounce (300ms) applied on all text search inputs

---

## 🗺️ Roadmap

### ✅ Month 1 (Complete)
- [x] Project setup and folder structure
- [x] JWT authentication system
- [x] Sequelize migrations with UUID
- [x] Places database with real seed data
- [x] Places listing with search and filters
- [x] Place detail page
- [x] AI guide with Groq and DB caching
- [x] Navbar with auth state and route guards

### 🔄 Month 1 — In Progress
- [ ] User role system (user / admin)
- [ ] Place submission by community
- [ ] Admin panel (approve / reject submissions)
- [ ] Visited places feature

### 📅 Month 2
- [ ] Docker and docker-compose
- [ ] Google OAuth
- [ ] PostGIS for location-based nearby discovery
- [ ] Wikidata API integration
- [ ] vue-i18n internationalization
- [ ] Password strength indicator

### 📅 Month 3
- [ ] Trip planner with itinerary builder
- [ ] Personal travel journal
- [ ] Dashboard with widgets

### 📅 Month 4
- [ ] Deployment (Render + Vercel + Supabase)
- [ ] Full documentation
- [ ] Resume update

---

## 👩‍💻 Author

Built by **Juee Gore**.

---

## 📄 License

MIT