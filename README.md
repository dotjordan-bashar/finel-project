# DriveJo - Car Rental Website

DriveJo is a car rental website for Jordan that I built as my final project for the DOT Jordan Full-Stack Web Development Bootcamp. It uses the MERN stack (MongoDB, Express, React and Node.js).

The idea is simple. People who own cars can list them on the site, customers can search for a car and book it for the days they need, and an admin checks the cars before they show up and manages everything on the site.

## How the site works

There are three types of users.

A customer can browse the cars, search and filter them, open a car's page and book it from one date to another. The total price is calculated from the price per day and the number of days. Customers can see all their bookings and cancel a booking if they change their mind.

An owner can add their own cars with the details (brand, model, year, city, category, transmission, fuel type, price per day and an image link). They can edit or delete their cars, or hide a car for a while without deleting it. When a customer books one of their cars, the owner sees the request and can accept or reject it.

The admin has a dashboard with numbers about the site, like how many users, cars and bookings there are. The admin can change a user's role, disable or delete an account, approve or reject cars and manage all the bookings.

When an owner adds a new car or edits one, it goes back to pending and does not appear to customers until the admin approves it. This way nobody can post a fake or wrong car without it being checked first.

Bookings start as pending. The owner confirms them, and after the rental is done they are marked as completed. They can also be cancelled. The site does not allow two bookings on the same car for days that overlap, so a car can't be booked twice at the same time.

## Other features

- Register and log in, and you stay logged in after refreshing the page
- Update your name, phone number and password from the profile page
- Search cars by brand or model
- Filter by city, category, transmission, fuel type and price range
- Sort the results and move between pages
- Every form is validated on the frontend and the backend, and the user sees a clear message when something is wrong
- The design works on phones, tablets and desktops

## Technologies I used

For the frontend I used React with Vite, React Router for the pages, Axios to talk to the API, and Bootstrap with Bootstrap Icons for the design.

For the backend I used Node.js and Express and organized the code in the MVC style (models, controllers and routes in separate folders). The data is saved in MongoDB using Mongoose.

Passwords are hashed with bcrypt before they are saved, and logging in returns a JWT token that the frontend sends with every request that needs the user to be logged in. Each route checks the user's role, so for example a customer can't open the admin pages or call the admin API. I used express-validator to check the data that reaches the server, and all errors go through one error handler so the responses always have the same shape.

## Folders

The project has two folders, `backend` and `frontend`.

Inside `backend` there is `config` for the database connection and some fixed lists (like the cities and categories), `models` for the User, Car and Booking schemas, `controllers` for the logic of each part, `routes` for the API endpoints, `middleware` for checking the login and roles, the validation rules and the error handler, and `utils` for small helpers. `server.js` starts the app and `seed.js` fills the database with demo data.

Inside `frontend/src` there is `pages` for every page of the site (with `owner` and `admin` folders for their own pages), `components` for parts that are used in many places like the navbar, the car card and the pagination, `context` for keeping track of the logged-in user, `api` for the Axios setup, and `utils` for constants and helper functions.

## How to run it

You need Node.js 18 or newer and MongoDB, either installed on your computer or a MongoDB Atlas link.

First run the backend:

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

The `npm run seed` step is optional. It adds some demo users, cars and bookings so the site isn't empty. The API runs on http://localhost:5000.

Then in another terminal run the frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The site opens on http://localhost:5173.

### The .env files

In `backend/.env` you need to set:

- `PORT` - the port of the API, for example 5000
- `NODE_ENV` - set it to development to see more details when there is an error
- `MONGO_URI` - the MongoDB connection link, for example mongodb://127.0.0.1:27017/car_rental
- `CLIENT_URL` - the address of the frontend, for example http://localhost:5173
- `JWT_SECRET` - a long random text used to sign the tokens (don't share it)
- `JWT_EXPIRES_IN` - how long the login stays valid, for example 7d

In `frontend/.env` you only need `VITE_API_URL`, which is the address of the API, for example http://localhost:5000/api.

## Demo accounts

If you ran the seed, you can log in with these accounts:

- Admin: admin@drivejo.com / admin123
- Owner: owner@drivejo.com / owner123
- Customer: customer@drivejo.com / customer123

## API

All the endpoints start with `/api`.

Auth:

- `POST /auth/register` - create a new account as a customer or owner
- `POST /auth/login` - log in and get a token
- `GET /auth/me` - get the logged-in user (needs login)
- `PUT /auth/me` - update name, phone or password (needs login)

Cars:

- `GET /cars` - list the approved cars. It accepts search, city, category, transmission, fuelType, minPrice, maxPrice, sort, page and limit in the query
- `GET /cars/:id` - get one car. A hidden car can only be seen by its owner or the admin
- `GET /cars/mine` - the cars of the logged-in owner (owner or admin)
- `POST /cars` - add a car (owner or admin)
- `PUT /cars/:id` - edit a car (the car's owner or admin)
- `DELETE /cars/:id` - delete a car (the car's owner or admin)

Bookings (all need login):

- `POST /bookings` - book a car (customer)
- `GET /bookings/my` - the customer's bookings
- `GET /bookings/owner` - the bookings on the owner's cars
- `PATCH /bookings/:id/status` - cancel, confirm or complete a booking, depending on who you are

Admin (only for the admin):

- `GET /admin/stats` - the numbers for the dashboard
- `GET /admin/users` - list the users, with search, role and page in the query
- `PATCH /admin/users/:id` - change a user's role or enable/disable them
- `DELETE /admin/users/:id` - delete a user and their data
- `GET /admin/cars` - list all the cars, with search, status and page in the query
- `PATCH /admin/cars/:id/status` - approve or reject a car
- `GET /admin/bookings` - list all the bookings, with status and page in the query
- `DELETE /admin/bookings/:id` - delete a booking

## Things I want to add later

- Uploading car photos instead of using image links
- Paying online
- Reviews and ratings for the cars and the owners
- Sending an email when a booking is confirmed
- An Arabic version of the site

## Demo video

The video link will be added here.
