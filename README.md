# 🚀 SalesFlow CRM - Backend Foundation

A **Salesforce-inspired CRM** backend built with modern Python technologies.  
Designed as a **beginner-friendly**, well-commented codebase following FastAPI best practices.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Business Flows](#-business-flows)
- [Setup Instructions](#-setup-instructions)
- [Running the App](#-running-the-app)
- [Testing the API](#-testing-the-api)
- [Architecture Overview](#-architecture-overview)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance web framework |
| **PostgreSQL** | Relational database |
| **SQLAlchemy** | ORM (Object-Relational Mapping) |
| **Pydantic** | Data validation & serialization |
| **JWT (python-jose)** | Token-based authentication |
| **Passlib + Bcrypt** | Secure password hashing |
| **Alembic** | Database migrations |
| **Uvicorn** | ASGI server |

---

## 📁 Folder Structure

```
salesflow-crm/
│
├── main.py                           # 🚀 Application entry point
├── requirements.txt                  # 📦 Python dependencies
├── .env                              # 🔐 Environment variables (secrets)
├── .gitignore                        # 🚫 Git ignore rules
├── alembic.ini                       # 🔄 Alembic migration config
│
├── core/                             # ⚙️ App configuration & settings
│   ├── __init__.py
│   └── config.py                     # Loads settings from .env
│
├── connection/                       # 🔌 Database connectivity
│   ├── __init__.py
│   └── database.py                   # SQLAlchemy engine, session, Base
│
├── database/                         # 🗄️ Database initialization helpers
│   ├── __init__.py
│   └── database.py                   # Table creation utilities
│
├── models/                           # 📊 SQLAlchemy models (DB tables)
│   ├── __init__.py
│   ├── user.py                       # User table definition
│   ├── lead.py                       # Lead table + LeadStatus enum
│   └── opportunity.py                # Opportunity table + Stage/Approval enums
│
├── schemas/                          # 📝 Pydantic schemas (validation)
│   ├── __init__.py
│   ├── user.py                       # User request/response schemas
│   ├── lead.py                       # Lead CRUD + search + convert schemas
│   └── opportunity.py                # Opportunity CRUD + approval schemas
│
├── auth/                             # 🔐 Authentication logic
│   ├── __init__.py
│   ├── hashing.py                    # Password hashing (bcrypt)
│   └── jwt_handler.py                # JWT token create/verify
│
├── services/                         # 💼 Business logic layer
│   ├── __init__.py
│   ├── user_service.py               # User CRUD operations
│   ├── lead_service.py               # Lead CRUD + conversion logic ⭐
│   └── opportunity_service.py        # Opportunity CRUD + approval workflow ⭐
│
├── routers/                          # 🛣️ API route handlers
│   ├── __init__.py
│   ├── auth_router.py                # Auth endpoints (/register, /login, /me)
│   ├── lead_router.py                # Lead endpoints (/leads/*)
│   └── opportunity_router.py         # Opportunity endpoints (/opportunities/*)
│
├── utils/                            # 🧰 Helper utilities
│   ├── __init__.py
│   └── helpers.py                    # Common helper functions
│
└── alembic/                          # 🔄 Database migrations
    ├── env.py                        # Migration environment config
    ├── script.py.mako                # Migration template
    └── versions/                     # Migration scripts (auto-generated)
        └── __init__.py
```

---

## 🗄️ Database Schema

### Users Table

```
┌──────────────────────────────────────────────────────────────┐
│                          users                                │
├──────────────┬──────────────┬────────────────────────────────┤
│ Column       │ Type         │ Constraints                    │
├──────────────┼──────────────┼────────────────────────────────┤
│ id           │ INTEGER      │ PRIMARY KEY, AUTO INCREMENT    │
│ full_name    │ VARCHAR(100) │ NOT NULL                       │
│ email        │ VARCHAR(255) │ UNIQUE, NOT NULL, INDEXED      │
│ password_hash│ VARCHAR(255) │ NOT NULL                       │
│ created_at   │ TIMESTAMP    │ DEFAULT NOW()                  │
└──────────────┴──────────────┴────────────────────────────────┘
```

### Leads Table

```
┌──────────────────────────────────────────────────────────────┐
│                          leads                                │
├──────────────┬──────────────┬────────────────────────────────┤
│ Column       │ Type         │ Constraints                    │
├──────────────┼──────────────┼────────────────────────────────┤
│ id           │ INTEGER      │ PRIMARY KEY, AUTO INCREMENT    │
│ name         │ VARCHAR(100) │ NOT NULL                       │
│ email        │ VARCHAR(255) │ NOT NULL                       │
│ phone        │ VARCHAR(20)  │ NULLABLE                       │
│ company      │ VARCHAR(150) │ NULLABLE                       │
│ source       │ VARCHAR(100) │ NULLABLE                       │
│ status       │ ENUM         │ NOT NULL, DEFAULT 'New'        │
│ owner_id     │ INTEGER      │ FK → users.id, NOT NULL        │
│ created_at   │ TIMESTAMP    │ DEFAULT NOW()                  │
└──────────────┴──────────────┴────────────────────────────────┘

Status Values: New | Contacted | Qualified | Lost | Converted
```

### Opportunities Table

```
┌───────────────────────────────────────────────────────────────┐
│                       opportunities                            │
├──────────────────┬──────────────┬─────────────────────────────┤
│ Column           │ Type         │ Constraints                 │
├──────────────────┼──────────────┼─────────────────────────────┤
│ id               │ INTEGER      │ PRIMARY KEY, AUTO INCREMENT │
│ opportunity_name │ VARCHAR(200) │ NOT NULL                    │
│ lead_id          │ INTEGER      │ FK → leads.id, NOT NULL     │
│ owner_id         │ INTEGER      │ FK → users.id, NOT NULL     │
│ deal_value       │ FLOAT        │ NOT NULL, DEFAULT 0.0       │
│ stage            │ ENUM         │ NOT NULL, DEFAULT Prospecting│
│ expected_close   │ DATE         │ NULLABLE                    │
│ approval_status  │ ENUM         │ NOT NULL, DEFAULT Approved  │
│ created_at       │ TIMESTAMP    │ DEFAULT NOW()               │
└──────────────────┴──────────────┴─────────────────────────────┘

Stage Values: Prospecting | Proposal | Negotiation | Won | Lost
Approval:     Pending | Approved | Rejected
```

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌───────────────────┐
│    Users     │       │    Leads     │       │  Opportunities    │
├─────────────┤       ├─────────────┤       ├───────────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │◄──┐   │ id (PK)           │
│ full_name   │   │   │ name        │   │   │ opportunity_name  │
│ email       │   ├───│ owner_id(FK)│   ├───│ lead_id (FK)      │
│ password_hash│   │   │ email       │   │   │ owner_id (FK)─────┤──┐
│ created_at  │   │   │ phone       │   │   │ deal_value        │  │
└─────────────┘   │   │ company     │   │   │ stage             │  │
                  │   │ source      │   │   │ expected_close    │  │
                  │   │ status      │   │   │ approval_status   │  │
                  │   │ created_at  │   │   │ created_at        │  │
                  │   └─────────────┘   │   └───────────────────┘  │
                  │                     │                          │
                  └─────────────────────┴──────────────────────────┘
```

---

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint    | Description              | Auth Required |
|--------|-------------|--------------------------|---------------|
| POST   | `/register` | Register a new user      | ❌ No         |
| POST   | `/login`    | Login & get JWT token    | ❌ No         |
| GET    | `/me`       | Get current user profile | ✅ Yes        |

### Lead Endpoints

| Method | Endpoint              | Description                    | Auth Required |
|--------|-----------------------|--------------------------------|---------------|
| POST   | `/leads/`             | Create a new lead              | ✅ Yes        |
| GET    | `/leads/`             | List leads (with filters)      | ✅ Yes        |
| GET    | `/leads/search`       | Search leads by criteria       | ✅ Yes        |
| GET    | `/leads/{id}`         | Get a single lead              | ✅ Yes        |
| PUT    | `/leads/{id}`         | Update a lead                  | ✅ Yes        |
| DELETE | `/leads/{id}`         | Delete a lead                  | ✅ Yes        |
| POST   | `/leads/{id}/convert` | Convert lead to opportunity ⭐ | ✅ Yes        |

### Opportunity Endpoints

| Method | Endpoint                        | Description                     | Auth Required |
|--------|---------------------------------|---------------------------------|---------------|
| POST   | `/opportunities/`               | Create an opportunity           | ✅ Yes        |
| GET    | `/opportunities/`               | List opportunities (filters)    | ✅ Yes        |
| GET    | `/opportunities/{id}`           | Get a single opportunity        | ✅ Yes        |
| PUT    | `/opportunities/{id}`           | Update an opportunity           | ✅ Yes        |
| DELETE | `/opportunities/{id}`           | Delete an opportunity           | ✅ Yes        |
| POST   | `/opportunities/{id}/approval`  | Approve or reject a deal ⭐     | ✅ Yes        |

### Utility Endpoints

| Method | Endpoint  | Description   | Auth Required |
|--------|-----------|---------------|---------------|
| GET    | `/`       | API info      | ❌ No         |
| GET    | `/health` | Health check  | ❌ No         |

---

## ⭐ Business Flows

### 1. Lead Lifecycle

```
                    ┌──────────────┐
                    │   New Lead   │
                    │  (Created)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Contacted   │
                    │ (Reached out)│
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
               ┌────│  Qualified   │────┐
               │    │ (Good fit!)  │    │
               │    └──────────────┘    │
               │                        │
        ┌──────▼───────┐         ┌──────▼───────┐
        │     Lost     │         │  Converted   │
        │  (No deal)   │         │ (→ Opp.)  ⭐ │
        └──────────────┘         └──────────────┘
```

### 2. Lead Conversion (Interview-Ready!)

```
POST /leads/{id}/convert?opportunity_name=...&deal_value=...

Step 1: Validate lead exists and status == "Qualified"
Step 2: Create new Opportunity from lead data
Step 3: Check deal value:
        → deal_value > ₹1,00,000 → approval_status = "Pending"
        → deal_value ≤ ₹1,00,000 → approval_status = "Approved"
Step 4: Update lead status → "Converted"
Step 5: Return conversion summary
```

### 3. Approval Workflow

```
POST /opportunities/{id}/approval

┌─────────────────────────────────────────────────┐
│              APPROVAL WORKFLOW                   │
│                                                  │
│  Opportunity Created                             │
│       │                                          │
│       ├── deal_value ≤ ₹1,00,000                │
│       │       → Auto Approved ✅                 │
│       │                                          │
│       └── deal_value > ₹1,00,000                │
│               → Status = "Pending" ⏳            │
│               → Manager Reviews                  │
│                    │                              │
│                    ├── Approve → "Approved" ✅    │
│                    └── Reject  → "Rejected" ❌    │
└─────────────────────────────────────────────────┘
```

---

## 📡 API Request/Response Examples

### Create a Lead

**Request:** `POST /leads/`
```json
{
    "name": "Rahul Sharma",
    "email": "rahul@acmecorp.com",
    "phone": "+91-9876543210",
    "company": "Acme Corporation",
    "source": "Website"
}
```

**Response (201):**
```json
{
    "id": 1,
    "name": "Rahul Sharma",
    "email": "rahul@acmecorp.com",
    "phone": "+91-9876543210",
    "company": "Acme Corporation",
    "source": "Website",
    "status": "New",
    "owner_id": 1,
    "created_at": "2026-06-06T12:00:00Z"
}
```

### Convert Lead to Opportunity

**Request:** `POST /leads/1/convert?opportunity_name=Acme Enterprise Plan&deal_value=150000`

**Response (201):**
```json
{
    "message": "Lead successfully converted to opportunity!",
    "lead_id": 1,
    "lead_status": "Converted",
    "opportunity_id": 1,
    "opportunity_name": "Acme Enterprise Plan",
    "deal_value": 150000.0,
    "approval_status": "Pending"
}
```

### Approve a Deal

**Request:** `POST /opportunities/1/approval`
```json
{
    "action": "Approved",
    "reason": "Deal value is reasonable for enterprise client"
}
```

**Response:**
```json
{
    "message": "Opportunity 'Acme Enterprise Plan' has been approved",
    "opportunity_id": 1,
    "opportunity_name": "Acme Enterprise Plan",
    "deal_value": 150000.0,
    "approval_status": "Approved",
    "reason": "Deal value is reasonable for enterprise client"
}
```

### Search Leads

**Request:** `GET /leads/search?name=rahul&status=Qualified`

**Response:**
```json
[
    {
        "id": 1,
        "name": "Rahul Sharma",
        "email": "rahul@acmecorp.com",
        "status": "Qualified",
        ...
    }
]
```

### Filter Opportunities

**Request:** `GET /opportunities/?stage=Prospecting&approval_status=Pending`

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.10+** installed
- **PostgreSQL** installed and running
- **pip** package manager

### Step 1: Navigate to Project

```bash
cd salesflow-crm
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Create PostgreSQL Database

Open **pgAdmin** or **psql** and create a new database:

```sql
CREATE DATABASE salesflow_crm;
```

### Step 5: Configure Environment Variables

Edit the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/salesflow_crm
SECRET_KEY=generate-a-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Generate a secret key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 6: Run Database Migrations (Optional)

```bash
# Generate migration
alembic revision --autogenerate -m "create all tables"

# Apply migration
alembic upgrade head
```

> **Note:** The app auto-creates tables on startup using `Base.metadata.create_all()`.

---

## ▶️ Running the App

```bash
# Start the development server with auto-reload
uvicorn main:app --reload
```

The API will be available at:
- **API Root:** http://127.0.0.1:8000
- **Swagger Docs:** http://127.0.0.1:8000/docs
- **ReDoc Docs:** http://127.0.0.1:8000/redoc

---

## 🧪 Testing the API

### Using Swagger UI (Recommended for Beginners)

1. Open http://127.0.0.1:8000/docs
2. **Register** → POST /register
3. **Login** → POST /login (copy the token)
4. Click **Authorize** 🔒 button (top-right)
5. Paste the token and click **Authorize**
6. Now test any protected endpoint!

### Complete Test Flow

```
1. POST /register       → Create account
2. POST /login          → Get JWT token
3. POST /leads/         → Create a lead (status: New)
4. PUT  /leads/1        → Update status to "Contacted"
5. PUT  /leads/1        → Update status to "Qualified"
6. POST /leads/1/convert → Convert lead → Opportunity (deal: ₹1.5L)
7. GET  /opportunities/ → See the new opportunity (approval: Pending)
8. POST /opportunities/1/approval → Approve the deal
9. GET  /opportunities/1 → Confirm approval status
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                       │
│              (React, Mobile App, Postman, etc.)               │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Request
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI APPLICATION                        │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │   Auth Router    │  │   Lead Router    │  │ Opp Router│  │
│  │ /register        │  │ /leads/*         │  │ /opps/*   │  │
│  │ /login, /me      │  │ CRUD + Convert   │  │ CRUD+Appr │  │
│  └────────┬─────────┘  └────────┬─────────┘  └─────┬─────┘  │
│           │                     │                   │        │
│  ┌────────▼─────────────────────▼───────────────────▼─────┐  │
│  │                    SERVICES LAYER                       │  │
│  │  user_service  │  lead_service  │  opportunity_service  │  │
│  │  (register,    │  (CRUD, search │  (CRUD, approval      │  │
│  │   login)       │   convert)     │   workflow)           │  │
│  └────────┬─────────────────────┬───────────────────┬─────┘  │
│           │                     │                   │        │
│  ┌────────▼─────────────────────▼───────────────────▼─────┐  │
│  │                    MODELS + SCHEMAS                     │  │
│  │  User Model    │  Lead Model    │  Opportunity Model    │  │
│  │  User Schema   │  Lead Schema   │  Opportunity Schema   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                       │
│                                                               │
│   ┌─────────┐        ┌──────────┐       ┌───────────────┐   │
│   │  users  │◄───────│  leads   │◄──────│ opportunities │   │
│   │         │ owner  │          │ lead  │               │   │
│   └─────────┘        └──────────┘       └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Key Concepts for Interviews

### What is Lead Conversion?
> Lead conversion is the process of transforming a qualified potential customer (Lead)
> into an active deal (Opportunity). It's a core CRM workflow that bridges
> marketing/prospecting with active sales.

### What is the Approval Workflow?
> High-value deals (> ₹1,00,000) require manager approval before proceeding.
> This is a business control to prevent unauthorized large commitments.
> The system auto-flags these deals as "Pending" and a manager must
> explicitly Approve or Reject them.

### Why Separate Services from Routers?
> **Single Responsibility Principle** — Routes handle HTTP concerns
> (request parsing, status codes), while Services handle business logic
> (database operations, validation rules). This makes the code testable,
> reusable, and easier to maintain.

### How does Dependency Injection work?
> FastAPI's `Depends()` automatically creates and provides dependencies.
> Example: `db: Session = Depends(get_db)` gives each route a fresh
> database session. `current_user: User = Depends(get_current_user)`
> automatically validates the JWT token and fetches the user.

---

## 🔮 Future Expansion

- [ ] Contact Management
- [ ] Dashboard Analytics & Reports
- [ ] Role-Based Access Control (Admin, Manager, Sales Rep)
- [ ] Email Notifications on status changes
- [ ] Activity/Audit Logging
- [ ] Pipeline Visualization
- [ ] Bulk Import/Export (CSV)

---

## 📝 License

This project is for educational purposes.

---

**Built with ❤️ using FastAPI + PostgreSQL**
