Build the frontend for my existing FastAPI CRM project called SalesFlow CRM.

IMPORTANT:

This project is for a fresher portfolio and interview preparation.

Do NOT create an enterprise-level frontend.

Keep the code simple, clean, beginner-friendly, and easy to explain in interviews.

Tech Stack:

* React
* Vite
* Tailwind CSS
* Axios
* React Router DOM

Do NOT use:

* Redux
* Zustand
* Context API for complex state
* Material UI
* Shadcn
* Chakra UI
* TypeScript
* React Query
* Advanced patterns

Use only React hooks (useState, useEffect).

Design Goal:

Create a simple modern dashboard that looks professional but remains easy to understand.

Use:

* White background
* Light gray sections
* Blue accent color
* Rounded cards
* Clean spacing
* Simple tables
* Responsive layout

Application Layout:

Sidebar on the left:

* Dashboard
* Leads
* Opportunities
* Reports
* Logout

Top Navbar:

* Page Title
* User Name
* Profile Circle

Pages Required:

1. Login Page

Fields:

* Email
* Password

Features:

* Login Form
* Validation
* Loading State

2. Register Page

Fields:

* Full Name
* Email
* Password

Features:

* Registration Form
* Validation

3. Dashboard Page

Create simple summary cards:

* Total Leads
* Qualified Leads
* Total Opportunities
* Won Deals

Show cards in a responsive grid.

Below cards create:

Recent Leads Table

Columns:

* Name
* Company
* Status

Create simple charts using Recharts:

Chart 1:
Leads by Status

Chart 2:
Opportunities by Stage

Keep charts simple.

4. Leads Page

Features:

* Search Input
* Status Filter Dropdown
* Create Lead Button
* Leads Table

Columns:

* Lead Name
* Company
* Email
* Status
* Actions

Actions:

* View
* Edit
* Delete

5. Create Lead Page

Form Fields:

* Name
* Email
* Phone
* Company
* Source
* Status

Features:

* Form Validation
* Submit Button
* Success Message

6. Opportunities Page

Table Columns:

* Opportunity Name
* Deal Value
* Stage
* Approval Status

Display stage badges:

* Prospecting
* Proposal
* Negotiation
* Won
* Lost

Display approval badges:

* Pending
* Approved
* Rejected

7. Reports Page

Summary Cards:

* Total Revenue
* Won Deals
* Lost Deals
* Conversion Rate

Simple Revenue Table

Frontend Folder Structure:

src/

* components/
* pages/
* services/
* layouts/
* routes/
* assets/

Components:

* Sidebar.jsx
* Navbar.jsx
* StatCard.jsx
* LeadTable.jsx
* OpportunityTable.jsx
* LoadingSpinner.jsx

Layouts:

* DashboardLayout.jsx

Services:

* api.js
* authService.js
* leadService.js
* opportunityService.js

API Integration:

Use Axios.

Create one api.js file with:

* Base URL
* Token Handling
* Request Configuration

Authentication:

Store JWT token in localStorage.

Create Protected Routes.

Code Requirements:

* Add comments
* Use simple React patterns
* Avoid unnecessary abstraction
* Keep components small
* Use beginner-friendly naming

Documentation:

Generate:

1. Folder Structure
2. Setup Instructions
3. API Integration Guide
4. Component Explanation
5. Interview Explanation for each page

The final UI should look clean and professional but remain simple enough for a fresher to fully understand and explain during interviews.
