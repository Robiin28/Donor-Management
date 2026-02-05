Here’s a clean, portfolio-ready README.md you can paste into your GitHub repo (adjust names/URLs if you want).

# Donor Management System (Full-Stack SPA)

A full-stack Donor Management System built with **React (Vite)** on the frontend and **CodeIgniter 4 (REST API)** on the backend, using **PostgreSQL** for data storage.  
The React app is **built with Vite and served from the CodeIgniter `public/` folder** (single deployable app), not a separately hosted frontend.

---

## Features

- Donor CRUD (Create, Read, Update, Delete)
- Segments & Categories (e.g., `individual | corporate | foundation`, `recurring | VIP | major`)
- Pagination + search/filter-ready API structure
- Reports endpoint (aggregated insights)
- Consistent JSON API responses (success/error envelopes)
- Production-style deployment setup using Docker

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Framer Motion (UI animations)

**Backend**
- CodeIgniter 4 (REST API)
- Validation + consistent response helpers
- Migrations (database schema management)

**Database**
- PostgreSQL

**Dev/Deploy**
- Docker + Docker Compose

---

## Project Structure



Donor_project/
frontend/ # React + Vite source
backend/ # CodeIgniter 4 backend
app/
public/ # Serves CI4 + built React assets
index.html # Vite build output entry
assets/ # Vite build output
index.php # CI4 front controller


---

## How the Frontend Works Here (Important)

This project is deployed as **one app**:

1. You develop UI inside `frontend/`.
2. Run `npm run build` to generate static files.
3. The build output is copied into `backend/public/` (served by CodeIgniter hosting).
4. The backend serves:
   - API routes under `/api/...`
   - SPA routes (React) via `public/index.html` for client-side routing

---

## Setup (Local Development)

### 1) Clone
```bash
git clone <your-repo-url>
cd Donor_project

2) Frontend install
cd frontend
npm install

3) Backend install
cd ../backend
composer install

Environment Variables

Create backend/.env (or copy from .env.example if you have one) and set:

CI_ENVIRONMENT=development
app.baseURL='http://localhost:8080/'

database.default.DBDriver=Postgre
database.default.hostname=postgres
database.default.database=donors
database.default.username=postgres
database.default.password=postgres
database.default.port=5432


If you are using Docker Compose, the DB hostname is usually the service name (e.g. postgres), not 127.0.0.1.

Run with Docker (Recommended)

From the project root:

docker compose up -d --build


Run migrations (inside the web container):

docker compose exec web php spark migrate


Open:

App: http://localhost:8080

API: http://localhost:8080/api/donors

Build Frontend for Production

From frontend/:

npm run build


Copy/ensure the build output goes to backend/public/:

backend/public/index.html

backend/public/assets/*

Then your backend serves the SPA automatically.

API Endpoints (Main)

Base: /api

GET /api/donors (pagination support)

GET /api/donors/{id}

POST /api/donors/store

PUT /api/donors/update/{id}

DELETE /api/donors/delete/{id}

GET /api/donors/report

Pagination Params Example

GET /api/donors?page=1&per_page=10
