# SalesFlow CRM

A full-stack Customer Relationship Management application inspired by Salesforce, built to streamline sales pipelines, manage leads, track deals, and automate approval workflows.

---

## Why This Project?

Sales teams lose deals and miss opportunities when they rely on spreadsheets, sticky notes, or scattered tools. **SalesFlow CRM** solves this by providing a centralized platform where:

- Leads are captured, tracked, and moved through a structured sales pipeline
- Qualified leads convert into real opportunities with a single action
- High-value deals trigger automatic approval gates so nothing slips through
- Dashboards and reports give instant visibility into pipeline health

This project was built as a **portfolio-grade, interview-ready** application demonstrating real-world CRM patterns — not just CRUD, but actual business logic like lead conversion workflows and approval chains.

---

## What Problems It Solves

| Problem | How SalesFlow CRM Solves It |
|---|---|
| Leads scattered across emails and spreadsheets | Centralized lead management with search, filter, and status tracking |
| No visibility into deal pipeline | Dashboard with charts, stats, and recent activity |
| Large deals approved without oversight | Automatic approval workflow — deals over Rs. 1,00,000 require manager sign-off |
| Manual lead-to-deal handoff | One-click lead conversion with automatic opportunity creation |
| No audit trail for sales actions | Timestamps on every record, structured status lifecycle |
| Difficulty tracking which leads converted | Lead status tracks full lifecycle: New > Contacted > Qualified > Converted/Lost |

---

## What It Makes Easier

- **For Sales Reps**: Create leads, update statuses, convert qualified leads into deals — all from one interface
- **For Managers**: Review and approve/reject high-value deals with reason tracking
- **For Decision Makers**: Dashboard shows total leads, qualified leads, won deals, and revenue at a glance
- **For Developers**: Clean 3-layer architecture (Router > Service > Model) makes the codebase easy to extend

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Python 3.13 | Core language |
| FastAPI | High-performance async web framework |
| SQLAlchemy 2.0 | ORM for database modeling |
| Pydantic v2 | Request/response data validation |
| Alembic | Database migration management |
| python-jose | JWT token creation and verification |
| bcrypt | Secure password hashing |
| Uvicorn | ASGI server for running FastAPI |

### Database

| Technology | Purpose |
|---|---|
| SQLite | Local development database (salesflow_crm.db) |
| PostgreSQL | Production-ready database (psycopg adapter included) |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| Tailwind CSS 4 | Utility-first styling |
| React Router v7 | Client-side routing |
| Axios | HTTP client with JWT interceptors |
| Recharts | Dashboard charts (bar + pie) |

---

## Project Structure

```
salesflow-crm/
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (DB, JWT config)
├── alembic.ini                # Alembic migration config
│
├── core/config.py             # Pydantic Settings (loads .env)
├── connection/database.py     # SQLAlchemy engine, session, Base
├── database/database.py       # Table creation utilities
│
├── models/                    # SQLAlchemy ORM models
│   ├── user.py                #   Users table
│   ├── lead.py                #   Leads table + LeadStatus enum
│   └── opportunity.py         #   Opportunities table + Stage/Approval enums
│
├── schemas/                   # Pydantic request/response schemas
│   ├── user.py                #   UserCreate, UserLogin, UserResponse
│   ├── lead.py                #   LeadCreate, LeadUpdate, LeadSearch
│   └── opportunity.py         #   OpportunityCreate, ApprovalAction
│
├── auth/                      # Authentication logic
│   ├── hashing.py             #   Bcrypt password hashing
│   └── jwt_handler.py         #   JWT token creation + get_current_user
│
├── services/                  # Business logic layer
│   ├── user_service.py        #   Registration, login
│   ├── lead_service.py        #   Lead CRUD + conversion logic
│   └── opportunity_service.py #   Opportunity CRUD + approval workflow
│
├── routers/                   # API route handlers
│   ├── auth_router.py         #   /register, /login, /me
│   ├── lead_router.py         #   /leads/*
│   └── opportunity_router.py  #   /opportunities/*
│
├── utils/helpers.py           # Common helper functions
├── alembic/                   # Database migrations
│
└── frontend/                  # React frontend application
    ├── src/
    │   ├── components/        #   Sidebar, Navbar, StatCard, Tables
    │   ├── pages/             #   Login, Dashboard, Leads, Opportunities, Reports
    │   ├── layouts/           #   DashboardLayout
    │   └── services/          #   API service layer (Axios + JWT)
    ├── package.json
    └── vite.config.js
```

---

## Database Schema

### Users

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| full_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Leads

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | NULLABLE |
| company | VARCHAR(150) | NULLABLE |
| source | VARCHAR(100) | NULLABLE |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'New' |
| owner_id | INTEGER | FK > users.id |
| created_at | TIMESTAMP | DEFAULT NOW() |

**Status values**: New, Contacted, Qualified, Converted, Lost

### Opportunities

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| opportunity_name | VARCHAR(200) | NOT NULL |
| lead_id | INTEGER | FK > leads.id |
| owner_id | INTEGER | FK > users.id |
| deal_value | FLOAT | NOT NULL, DEFAULT 0.0 |
| stage | VARCHAR(20) | NOT NULL, DEFAULT 'Prospecting' |
| expected_close_date | DATE | NULLABLE |
| approval_status | VARCHAR(20) | NOT NULL, DEFAULT 'Approved' |
| created_at | TIMESTAMP | DEFAULT NOW() |

**Stage values**: Prospecting, Proposal, Negotiation, Won, Lost
**Approval values**: Pending, Approved, Rejected

### Entity Relationships

```
Users (1) ---< (many) Leads (1) ---< (many) Opportunities
  ^                                         |
  |_________________________________________|  (owner_id FK)
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login and get JWT token | No |
| GET | `/me` | Get current user profile | Yes |

### Leads

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/leads/` | Create a new lead | Yes |
| GET | `/leads/` | List leads (with filters) | Yes |
| GET | `/leads/search` | Search leads by criteria | Yes |
| GET | `/leads/{id}` | Get a single lead | Yes |
| PUT | `/leads/{id}` | Update a lead | Yes |
| DELETE | `/leads/{id}` | Delete a lead | Yes |
| POST | `/leads/{id}/convert` | Convert lead to opportunity | Yes |

### Opportunities

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/opportunities/` | Create an opportunity | Yes |
| GET | `/opportunities/` | List opportunities (with filters) | Yes |
| GET | `/opportunities/{id}` | Get a single opportunity | Yes |
| PUT | `/opportunities/{id}` | Update an opportunity | Yes |
| DELETE | `/opportunities/{id}` | Delete an opportunity | Yes |
| POST | `/opportunities/{id}/approval` | Approve or reject a deal | Yes |

### Utility

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | API info | No |
| GET | `/health` | Health check | No |

---

## Business Flows

### Lead Lifecycle

```
New Lead > Contacted > Qualified > Converted (into Opportunity)
                                 > Lost (no deal)
```

### Lead Conversion Flow

```
POST /leads/{id}/convert

1. Validate lead exists and status is "Qualified"
2. Create new Opportunity from lead data
3. Check deal value:
   - deal_value > Rs. 1,00,000  ->  approval_status = "Pending"
   - deal_value <= Rs. 1,00,000 ->  approval_status = "Approved"
4. Update lead status to "Converted"
5. Return conversion summary
```

### Approval Workflow

```
Opportunity Created
    |
    +-- deal_value <= Rs. 1,00,000  ->  Auto Approved
    |
    +-- deal_value > Rs. 1,00,000   ->  Status = "Pending"
                                         Manager Reviews
                                             |
                                             +-- Approve -> "Approved"
                                             +-- Reject  -> "Rejected" (with reason)
```

---

## Setup and Installation

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend)
- PostgreSQL (optional — SQLite works for development)

### Backend Setup

```bash
# Navigate to project root
cd salesflow-crm

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Configuration

Create or edit `.env` in the project root:

```env
# SQLite (local dev — no setup needed)
DATABASE_URL=sqlite:///./salesflow_crm.db

# PostgreSQL (production — uncomment and configure)
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/salesflow_crm

# JWT Settings
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Generate a secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Database Migrations (Optional)

```bash
# Generate a migration
alembic revision --autogenerate -m "create all tables"

# Apply the migration
alembic upgrade head
```

Tables are auto-created on startup via `Base.metadata.create_all()`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## Running the Application

### Start Backend

```bash
uvicorn main:app --reload
```

Backend available at:
- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend available at: http://localhost:3000

---

## Testing the API

### Quick Start with Swagger UI

1. Open http://127.0.0.1:8000/docs
2. Register a user via POST /register
3. Login via POST /login and copy the JWT token
4. Click the Authorize button and paste the token
5. Test any protected endpoint

### Full Test Flow

```
1. POST /register            -> Create account
2. POST /login               -> Get JWT token
3. POST /leads/              -> Create a lead (status: New)
4. PUT  /leads/1             -> Update status to "Contacted"
5. PUT  /leads/1             -> Update status to "Qualified"
6. POST /leads/1/convert     -> Convert to opportunity (deal: 150000)
7. GET  /opportunities/      -> See new opportunity (approval: Pending)
8. POST /opportunities/1/approval -> Approve the deal
9. GET  /opportunities/1     -> Confirm approval status
```

---

## Architecture

```
Client (React / Postman / Swagger)
    |
    v
FastAPI Application
    |
    +-- Routers (HTTP layer: request parsing, status codes)
    |       |
    +-- Services (Business logic: validation, workflows)
    |       |
    +-- Models + Schemas (Data layer: DB tables, validation)
    |
    v
Database (SQLite / PostgreSQL)
```

### Key Design Decisions

- **3-Layer Architecture**: Routers handle HTTP, Services handle business logic, Models handle data — clean separation of concerns
- **Dependency Injection**: FastAPI's `Depends()` manages DB sessions and auth automatically
- **Pydantic Schemas**: Separate request/response schemas from ORM models for clean API contracts
- **JWT Authentication**: Stateless token-based auth with 30-minute expiry and bcrypt password hashing

---

## Key Concepts

### Lead Conversion
The process of transforming a qualified potential customer (Lead) into an active deal (Opportunity). Only leads with "Qualified" status can be converted. The system automatically creates an opportunity and flags high-value deals for approval.

### Approval Workflow
Business control preventing unauthorized large commitments. Deals exceeding Rs. 1,00,000 are automatically set to "Pending" and require explicit manager approval. Managers can approve or reject with a documented reason.

### Service Layer Pattern
Routes delegate all business logic to service classes. This makes the code testable, reusable, and keeps route handlers thin and focused on HTTP concerns.

---

## Future Improvements

- Contact Management (companies, multiple contacts per company)
- Advanced Dashboard Analytics with date range filtering
- Role-Based Access Control (Admin, Manager, Sales Rep)
- Email Notifications on status changes
- Activity and Audit Logging
- Pipeline Visualization (drag-and-drop Kanban board)
- Bulk Import/Export (CSV)

---

## License

This project is for educational and portfolio purposes.

---

**Built with FastAPI, React, and SQLAlchemy**
