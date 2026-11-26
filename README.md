
# 🍰 Sweet Heaven

A full-stack bakery storefront and learning project built with HTML, CSS, JavaScript, Node.js, Express, and PostgreSQL.

## About the Project

Sweet Heaven is a boutique bakery website developed to practice frontend development, REST API design, database integration, and backend authentication.

The project is currently under development.

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

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js
- PostgreSQL

**Security**
- bcrypt
- JSON Web Tokens (JWT)
- express-rate-limit
- Environment variables with dotenv

## Running Locally

### Backend

1. Install Node.js and PostgreSQL.
2. Create a PostgreSQL database and the required tables.
3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Configure the required environment variables in a local `.env` file:

```env
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_secure_random_secret
```

5. Start the backend:

```bash
node server.js
```

The API runs at:

http://localhost:3000

### Frontend

Open `index.html` using VS Code Live Server.

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/admin/login | Public |
| POST | /api/products | Admin |
| PATCH | /api/products/:id | Admin |
| DELETE | /api/products/:id | Admin |

## Project Status

This is an educational project and is not yet production-ready.

Planned improvements include deployment, additional security controls, automated tests, and further storefront development.

## Author

**Masiha Maleki**

Web Development Portfolio Project
