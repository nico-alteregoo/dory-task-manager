# Task Tracker

A full-stack task management application built with **React, Node.js, Express, MySQL, and Sequelize**.

Users can create an account, manage their own tasks, organize tasks by category, search and filter tasks, and navigate through tasks using pagination.

## Live Demo

* **Frontend:** https://dory-task-manager.vercel.app
* **Backend API:** https://dory-task-managerserver-production.up.railway.app
* **API Health Check:** https://dory-task-managerserver-production.up.railway.app/api/health

## Features

### Authentication

* User registration
* User login
* JWT-based authentication
* Retrieve the currently authenticated user
* Protected routes
* Logout
* Password hashing with bcrypt
* Users can only access their own tasks

### Task Management

* Create tasks
* View tasks
* Edit tasks
* Delete tasks
* Task status:

  * `pending`
  * `in_progress`
  * `completed`
* Optional due dates
* Assign tasks to categories

### Search & Filtering

* Filter tasks by status
* Filter tasks by category
* Search tasks by title
* Pagination using `page` and `limit`

### Categories

* View categories
* Create categories
* Associate tasks with categories

### Frontend

* Responsive React interface
* Protected task pages
* Loading states
* Error handling
* Delete confirmation
* Authentication persists across page refreshes

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Sequelize
* JWT
* bcryptjs
* dotenv
* CORS

### Database

* MySQL

### Deployment

* Vercel — Frontend
* Railway — Backend & MySQL
* GitHub — Source Control

## Project Structure

```text
task-manager/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── axios-client.js
│   │   └── ...
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── config/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Database Structure

The application uses three main tables:

### User

| Field       | Type     | Description                 |
| ----------- | -------- | --------------------------- |
| `id`        | INTEGER  | Primary key, auto-increment |
| `name`      | STRING   | User's name                 |
| `email`     | STRING   | Unique email address        |
| `password`  | STRING   | Bcrypt hashed password      |
| `createdAt` | DATETIME | Automatically managed       |
| `updatedAt` | DATETIME | Automatically managed       |

### Category

| Field       | Type     | Description                 |
| ----------- | -------- | --------------------------- |
| `id`        | INTEGER  | Primary key, auto-increment |
| `name`      | STRING   | Category name               |
| `createdAt` | DATETIME | Automatically managed       |
| `updatedAt` | DATETIME | Automatically managed       |

### Task

| Field         | Type     | Description                              |
| ------------- | -------- | ---------------------------------------- |
| `id`          | INTEGER  | Primary key, auto-increment              |
| `title`       | STRING   | Required task title                      |
| `description` | TEXT     | Optional description                     |
| `status`      | ENUM     | `pending`, `in_progress`, or `completed` |
| `due_date`    | DATEONLY | Optional due date                        |
| `category_id` | INTEGER  | Foreign key to `Category`                |
| `user_id`     | INTEGER  | Foreign key to `User`                    |
| `createdAt`   | DATETIME | Automatically managed                    |
| `updatedAt`   | DATETIME | Automatically managed                    |

### Relationships

```text
User
  │
  └── 1 ─────────── * Task

Category
  │
  └── 1 ─────────── * Task
```

A **User has many Tasks**, and each Task belongs to a User.

A **Category has many Tasks**, and each Task belongs to a Category.

Users can only access their own tasks.

# API Documentation

The backend provides a REST API.

## Health Check

### `GET /api/health`

Checks whether the API is running.

**Authentication:** Not required.

## Authentication

### `POST /api/auth/register`

Creates a new user account.

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### `POST /api/auth/login`

Authenticates a user and returns a JWT.

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### `GET /api/auth/me`

Returns the currently authenticated user.

**Authentication:** Required.

```http
Authorization: Bearer <token>
```

## Categories

### `GET /api/categories`

Returns the available categories.

**Authentication:** Required.

### `POST /api/categories`

Creates a new category.

**Authentication:** Required.

**Request body:**

```json
{
  "name": "Work"
}
```

## Tasks

### `GET /api/tasks`

Returns the authenticated user's tasks.

**Authentication:** Required.

Supports filtering, searching, and pagination.

#### Query Parameters

| Parameter     | Description              |
| ------------- | ------------------------ |
| `status`      | Filter by task status    |
| `category_id` | Filter by category       |
| `search`      | Search task titles       |
| `page`        | Page number              |
| `limit`       | Number of tasks per page |

Example:

```text
/api/tasks?status=pending&category_id=1&search=meeting&page=1&limit=10
```

### `GET /api/tasks/:id`

Returns a single task.

The task must belong to the authenticated user.

**Authentication:** Required.

### `POST /api/tasks`

Creates a new task.

**Authentication:** Required.

**Request body:**

```json
{
  "title": "Finish project",
  "description": "Complete the remaining features",
  "status": "pending",
  "due_date": "2026-08-15",
  "category_id": 1
}
```

### `PUT /api/tasks/:id`

Updates an existing task.

The task must belong to the authenticated user.

**Authentication:** Required.

### `DELETE /api/tasks/:id`

Deletes a task.

The task must belong to the authenticated user.

**Authentication:** Required.

# Getting Started

## Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* MySQL
* Git
* npm

## 1. Clone the Repository

```bash
git clone https://github.com/nico-alteregoo/dory-task-manager.git
cd <your-project-folder>
```

# Backend Setup

Navigate to the backend directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_NAME=task_manager
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API should now be available at:

```text
http://localhost:5000
```

# Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The React application should now be available at:

```text
http://localhost:5173
```

# Environment Variables

## Backend

```env
PORT=5000
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

## Frontend

```env
VITE_API_BASE_URL=http://localhost:5000
```

> **Important:** Never commit `.env` files or sensitive credentials to GitHub.

Only `.env.example` files should be committed.

# Authentication Flow

The application uses JWT authentication.

```text
User
  │
  │ Login
  ▼
React Frontend
  │
  │ POST /api/auth/login
  ▼
Express API
  │
  │ Verify credentials
  ▼
JWT Token
  │
  ▼
Frontend
  │
  │ Authorization: Bearer <token>
  ▼
Protected API Routes
```

Protected requests include the JWT in the `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

The backend verifies the token before allowing access to protected resources.

# Security

The application implements several basic security practices:

* Passwords are hashed using `bcryptjs`.
* Passwords are never stored as plaintext.
* Protected API routes require a valid JWT.
* Users cannot access another user's tasks.
* Database credentials and JWT secrets are stored in environment variables.
* `.env` files are excluded from source control.
* Authentication middleware protects private endpoints.
* Basic request validation is performed on task and category operations.

# Deployment

## Frontend — Vercel

The React frontend is deployed using Vercel.

The frontend uses the following environment variable:

```env
VITE_API_BASE_URL=https://dory-task-managerserver-production.up.railway.app
```

The project is connected to GitHub, so new commits pushed to the repository can trigger a new deployment.

## Backend — Railway

The Express API is deployed using Railway.

The backend is connected to the MySQL database and uses environment variables for its database credentials and configuration.

CORS is configured to allow requests from the deployed frontend.

The deployed API can be verified using:

```text
GET /api/health
```

# Git & Deployment Workflow

The project uses GitHub for source control.

The deployment workflow is:

```text
Make changes
     │
     ▼
git add .
     │
     ▼
git commit
     │
     ▼
git push
     │
     ▼
   GitHub
    /   \
   ▼     ▼
Vercel  Railway
   │       │
   ▼       ▼
Frontend Backend
```

This makes deployment much simpler because changes can be pushed to GitHub instead of manually uploading individual files to production.

# Known Limitations & Trade-offs

* The application uses Sequelize database synchronization rather than a full migration workflow.
* Automated tests were not implemented due to the time constraints of the coding exam.
* The application focuses on the required task-management functionality rather than advanced collaboration features.
* Authentication and validation are implemented for the scope of this project but could be expanded further for a larger production system.

# Future Improvements

Possible improvements include:

* Add automated backend and frontend tests
* Add Sequelize migration files
* Add rate limiting to authentication endpoints
* Add password reset functionality
* Add task statistics and dashboard analytics
* Add more advanced category management
* Improve mobile responsiveness and UX

# Live Application

**Frontend:**
https://dory-task-manager.vercel.app

**Backend:**
https://dory-task-managerserver-production.up.railway.app

**Health Check:**
https://dory-task-managerserver-production.up.railway.app/api/health

# Author

Built as a full-stack developer coding exam project using **React, Node.js, Express, MySQL, and Sequelize**.
