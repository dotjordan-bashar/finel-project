# DriveJo – Car Rental Platform (MERN)

A full-stack car rental web app for Jordan. Car owners list their cars, customers search and book them, and an admin reviews cars and manages the whole platform.

Built as the final project for the **DOT Jordan Full-Stack Web Development Bootcamp**.

## Tech stack

| Part      | Technology                                         |
|-----------|----------------------------------------------------|
| Frontend  | React 19, React Router, Axios, Bootstrap 5, Bootstrap Icons, Vite |
| Backend   | Node.js, Express 5, MVC structure                  |
| Database  | MongoDB with Mongoose                              |
| Auth      | JWT (JSON Web Tokens) + bcrypt password hashing    |
| Validation| express-validator (backend) + form checks (frontend) |

## Features

- **Authentication:** register, log in, stay logged in with a JWT, update profile and password
- **3 roles with different permissions**
  - **Customer:** browse cars, book a car for specific dates, cancel bookings
  - **Owner:** add / edit / delete their cars, hide a car, accept or reject booking requests
  - **Admin:** dashboard with statistics, manage users (role, disable, delete), approve or reject cars, manage all bookings
- **Full CRUD** on cars, bookings and users
- **Search, filters, sorting and pagination** (brand/model search, city, category, transmission, fuel, price range)
- **Booking logic:** blocks overlapping bookings, calculates the total price, status flow `pending → confirmed → completed` (or `cancelled`)
- **Car review flow:** new or edited cars are `pending` until an admin approves them
- **Validation** on both frontend and backend, with clear error messages
- **Responsive design** for mobile, tablet and desktop

## Project structure

```
finelproject/
├── backend/
│   ├── config/         # database connection + shared constant lists
│   ├── controllers/    # request logic (auth, cars, bookings, admin)
│   ├── middleware/     # auth/roles, validation rules, error handler
│   ├── models/         # Mongoose schemas: User, Car, Booking
│   ├── routes/         # API endpoints
│   ├── utils/          # helpers: AppError, JWT, pagination
│   ├── seed.js         # demo data
│   └── server.js       # app entry point
└── frontend/
    └── src/
        ├── api/        # axios instance (adds the token to requests)
        ├── components/ # reusable UI: Navbar, CarCard, Pagination...
        ├── context/    # AuthContext (logged-in user)
        ├── pages/      # public, owner/ and admin/ pages
        └── utils/      # constants and helper functions
```

## Getting started

### Requirements
- Node.js 18 or newer
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit the values
npm run seed              # optional: adds demo data
npm run dev               # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # opens on http://localhost:5173
```

## Environment variables

**backend/.env**

| Variable        | Description                                  | Example |
|-----------------|----------------------------------------------|---------|
| `PORT`          | Port the API runs on                         | `5000` |
| `NODE_ENV`      | `development` shows error details            | `development` |
| `MONGO_URI`     | MongoDB connection string                    | `mongodb://127.0.0.1:27017/car_rental` |
| `CLIENT_URL`    | Frontend URL allowed by CORS                 | `http://localhost:5173` |
| `JWT_SECRET`    | Secret used to sign tokens (keep it private) | a long random string |
| `JWT_EXPIRES_IN`| How long a login lasts                       | `7d` |

**frontend/.env**

| Variable       | Description          | Example |
|----------------|----------------------|---------|
| `VITE_API_URL` | Base URL of the API  | `http://localhost:5000/api` |

## Demo accounts (after `npm run seed`)

| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Admin    | admin@drivejo.com      | admin123      |
| Owner    | owner@drivejo.com      | owner123      |
| Customer | customer@drivejo.com   | customer123   |

## API endpoints

All endpoints start with `/api`. 🔒 = needs a token.

### Auth
| Method | Endpoint          | Access | Description |
|--------|-------------------|--------|-------------|
| POST   | `/auth/register`  | Public | Create an account (customer or owner) |
| POST   | `/auth/login`     | Public | Log in, returns a token |
| GET    | `/auth/me`        | 🔒 Any | Current user |
| PUT    | `/auth/me`        | 🔒 Any | Update name, phone, password |

### Cars
| Method | Endpoint     | Access | Description |
|--------|--------------|--------|-------------|
| GET    | `/cars`      | Public | Approved cars. Query: `search, city, category, transmission, fuelType, minPrice, maxPrice, sort, page, limit` |
| GET    | `/cars/:id`  | Public | One car (hidden cars only for their owner/admin) |
| GET    | `/cars/mine` | 🔒 Owner | The owner's cars |
| POST   | `/cars`      | 🔒 Owner, Admin | Add a car |
| PUT    | `/cars/:id`  | 🔒 Owner of car, Admin | Edit a car |
| DELETE | `/cars/:id`  | 🔒 Owner of car, Admin | Delete a car |

### Bookings
| Method | Endpoint               | Access | Description |
|--------|------------------------|--------|-------------|
| POST   | `/bookings`            | 🔒 Customer | Book a car |
| GET    | `/bookings/my`         | 🔒 Customer | My bookings |
| GET    | `/bookings/owner`      | 🔒 Owner | Bookings on my cars |
| PATCH  | `/bookings/:id/status` | 🔒 Customer / Owner / Admin | Cancel, confirm, complete |

### Admin (🔒 Admin only)
| Method | Endpoint                  | Description |
|--------|---------------------------|-------------|
| GET    | `/admin/stats`            | Dashboard numbers |
| GET    | `/admin/users`            | Users. Query: `search, role, page` |
| PATCH  | `/admin/users/:id`        | Change role / enable / disable |
| DELETE | `/admin/users/:id`        | Delete a user and their data |
| GET    | `/admin/cars`             | All cars. Query: `search, status, page` |
| PATCH  | `/admin/cars/:id/status`  | Approve / reject a car |
| GET    | `/admin/bookings`         | All bookings. Query: `status, page` |
| DELETE | `/admin/bookings/:id`     | Delete a booking |

## Future ideas
- Upload car photos instead of using image links
- Online payment
- Reviews and ratings for cars and owners
- Email notifications when a booking is confirmed
- Arabic language support

## Video demo
_Add your demo video link here._
