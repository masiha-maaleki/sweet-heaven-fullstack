# 🍰 Sweet Heaven

A responsive full-stack bakery storefront built with HTML, CSS, JavaScript, Node.js, Express, and PostgreSQL.

## Live Demo

**Website:** https://masiha-maaleki.github.io/sweet-heaven-fullstack/

**Products API:** https://sweet-heaven-fullstack.onrender.com/api/products

## About the Project

Sweet Heaven is a portfolio and educational full-stack web development project inspired by a boutique bakery.

The project demonstrates the integration of a responsive frontend with a REST API, a PostgreSQL database, and JWT-based backend authentication.

Visitors can browse products, search and filter the catalogue, view individual product details, and manage a shopping cart stored in the browser.

The frontend is hosted on GitHub Pages, the Express backend is deployed on Render, and the PostgreSQL database is hosted on Neon.

This is a demonstration storefront, not a production e-commerce service. Online payments and real order processing are not implemented.

## Features

- Responsive bakery storefront
- Product catalogue with category filtering and search
- Individual product detail pages
- Shopping cart using localStorage
- PostgreSQL product database
- REST API for product management
- Admin login with bcrypt password verification
- JWT-protected product management routes
- Login rate limiting
- Server-side product validation

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive Web Design
- Fetch API
- LocalStorage

### Backend

- Node.js
- Express.js
- REST API
- PostgreSQL
- node-postgres (pg)

### Authentication & Security

- bcrypt password hashing
- JSON Web Tokens (JWT)
- express-rate-limit
- Server-side input validation
- Parameterized SQL queries
- Environment variables with dotenv
- CORS origin allowlist

### Deployment & Hosting

- GitHub Pages — Frontend
- Render — Backend API
- Neon — PostgreSQL Database
- Git & GitHub — Version Control


## Running Locally

### Prerequisites

- Node.js and npm
- PostgreSQL database (local or hosted)
- Git
- VS Code or another code editor

### 1. Clone the Repository

```bash
git clone https://github.com/masiha-maaleki/sweet-heaven-fullstack.git
cd sweet-heaven-fullstack
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

For a hosted PostgreSQL database:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_random_secret
```

For local PostgreSQL, configure the database connection according to `backend/db.js`.

Never commit `.env` files or real credentials to GitHub.

### 4. Prepare the Database

Create the required PostgreSQL tables for products and administrators.

The application requires an existing database schema before the backend can operate correctly.

### 5. Start the Backend

```bash
node server.js
```

The backend runs at `http://localhost:3000` by default.

### 6. Open the Frontend

Open `index.html` with VS Code Live Server or another local development server.

**Note:** The deployed frontend uses the Render API URL. To work with a local backend, update the API URLs in the frontend JavaScript files to `http://localhost:3000`.


## API Endpoints

| Method | Endpoint          | Access |
| ------ | ----------------- | ------ |
| GET    | /api/products     | Public |
| GET    | /api/products/:id | Public |
| POST   | /api/admin/login  | Public |
| POST   | /api/products     | Admin  |
| PATCH  | /api/products/:id | Admin  |
| DELETE | /api/products/:id | Admin  |


## Project Status

**Status: Deployed — Portfolio Demo**

The frontend, backend API, and PostgreSQL database are deployed and connected.

### Implemented and Tested
- Responsive product catalogue
- Product search, filtering, and sorting
- Individual product detail pages
- Shopping cart with localStorage persistence
- PostgreSQL-backed product API
- Admin authentication with bcrypt and JWT
- Protected product management API routes
- Login rate limiting
- CORS configuration for the deployed frontend

### Current Limitations
- No online payment integration
- No real order processing
- No customer account system
- No automated test suite

### Future Improvements
- Admin dashboard interface
- Automated API and frontend tests
- Additional security hardening
- Checkout and order management functionality


## Author

**Masiha Maleki**

Web Development Portfolio Project
