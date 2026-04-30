# Team Task Manager - MERN Stack

A full-stack team task management application built with MongoDB, Express, React, and Node.js. The app supports role-based access control, project management, task assignment, and member-specific task visibility so admins and employees see only what they are supposed to see.

## Overview

This project was built as a company-style assignment submission. It includes a clean React dashboard, secure JWT authentication, MongoDB Atlas integration, and backend rules that separate admin access from employee access.

Admins can create projects, assign members, create tasks, and manage the full workspace. Members can view only the tasks assigned to them, update task status, and work inside the projects they are part of.

## Features

### Admin Features
- Create, update, and delete projects
- Assign members to a project
- Create tasks and assign them to specific users
- View all tasks inside any project
- Update any task status or task details
- Delete tasks and projects

### Member Features
- View assigned projects
- View only their own assigned tasks inside a project
- See only their own dashboard task summary
- Update task status to Todo, In-Progress, or Completed
- Access project workspace without seeing other employees' tasks

### Security and Access Control
- JWT-based authentication
- Token support through cookies and Bearer headers
- Password hashing with bcryptjs
- Role-based route protection
- Admin-only routes for project/task creation and deletion
- Member task visibility restricted to assigned tasks only
- Past due dates blocked on both frontend and backend

### UI and UX
- Responsive dark-theme dashboard
- Clean project workspace layout
- Inline validation messages
- Task cards with status, priority, due date, and assignee details
- Separate admin and member views

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- bcryptjs
- cors
- cookie-parser
- dotenv

### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React
- Create React App

## Project Structure

```text
/backend
  controllers/
    authController.js
    dashboardController.js
    projectController.js
    taskController.js
  middleware/
    authMiddleware.js
  models/
    User.js
    Project.js
    Task.js
  routes/
    authRoutes.js
    dashboardRoutes.js
    projectRoutes.js
    taskRoutes.js
  server.js
  .env
  package.json

/frontend
  public/
    index.html
  src/
    components/
      ProtectedRoute.js
      TaskCard.js
    context/
      AuthContext.js
    pages/
      Login.js
      Dashboard.js
      ProjectView.js
    services/
      api.js
    App.js
    index.js
  .env
  package.json
  postcss.config.js
  tailwind.config.js

.gitignore
README.md
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.<your-cluster>.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

Start the backend server:

```bash
npm start
```

The server runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend app:

```bash
npm start
```

The app runs on `http://localhost:3000`.

## Available Scripts

### Backend
- `npm start` - Start the Express server
- `npm run dev` - Start the server with nodemon

### Frontend
- `npm start` - Start the React development server
- `npm run build` - Build the frontend for production
- `npm test` - Run frontend tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get logged-in user

### Dashboard
- `GET /api/dashboard/summary` - Get task summary for the current user

### Projects
- `GET /api/projects` - Get projects visible to the logged-in user
- `GET /api/projects/:id` - Get project details and tasks
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)
- `PATCH /api/projects/:id/members` - Assign project members (Admin only)

### Tasks
- `POST /api/tasks` - Create task (Admin only)
- `GET /api/tasks/project/:projectId` - Get tasks for a project
- `PATCH /api/tasks/:id` - Update task status or task fields depending on role
- `DELETE /api/tasks/:id` - Delete task (Admin only)

## Important Access Rules

- Admin sees all projects, all tasks, and all dashboard data.
- Member sees only projects they created, belong to, or have assigned tasks in.
- In a project workspace, a member sees only tasks assigned to them.
- In the dashboard summary, a member sees counts only for their assigned tasks.
- Task status can be updated by the assigned member or project member access as allowed by the backend rules.
- Due dates cannot be set to a past date.

## Environment Notes

- Backend uses MongoDB Atlas, not a local database.
- `.env` files are required locally and should not be committed.
- `node_modules` is ignored in version control.
- Frontend API requests are sent through the configured `REACT_APP_API_URL`.

## Deployment Notes

For production:
- Set the backend `MONGO_URI` to your Atlas connection string
- Update `CLIENT_URL` to your deployed frontend domain
- Set `REACT_APP_API_URL` to your deployed backend API URL
- Make sure the frontend and backend environment variables match the deployed domains

## Health Check

Backend health endpoint:
- `GET /api/health`

## Short Demo Flow

1. Register or log in as Admin.
2. Create a project.
3. Assign members and create tasks.
4. Log in as a Member.
5. Open the project workspace.
6. View only assigned tasks and update task status.

## Submission Summary

This codebase demonstrates:
- MERN stack development
- Authentication and authorization
- Role-based UI and API access
- Real-time task workflow management
- Clean project structure for deployment and presentation
