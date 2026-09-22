# Project Hub

A multi-tenant project management and ticket collaboration platform inspired by tools like Jira and Asana.

Project Hub allows organizations to manage users, teams, projects, tasks, and task discussions from a centralized workspace.

## Features

- Multi-tenant organization architecture
- JWT-based authentication
- HTTP-only authentication cookies
- Role-based access control
- User management
- Team management
- Project management
- Task management
- Kanban board with drag-and-drop
- Task status and priority management
- Task assignment
- Task comments
- Protected frontend routes
- Tenant isolation
- Request validation with Zod
- CSRF protection
- Rate limiting
- Helmet security headers
- Centralized error handling
- Audit logging

## User Roles

### Admin

- Manage users
- Manage teams
- Manage projects
- Manage tasks
- Manage organization resources
- Manage user roles

### Project Manager

- Manage projects
- Manage project members
- Manage tasks
- Assign tasks
- Manage task status and priority
- Manage comments

### Developer

- View assigned projects and tasks
- Update task status
- Work with assigned tasks
- Add and manage own task comments

## Tech Stack

### Frontend

- React
- TypeScript
- React Router
- Tailwind CSS
- dnd-kit
- Lucide React
- Vite

### Backend

- Node.js
- Express
- TypeScript
- JWT
- bcrypt
- Zod
- Helmet
- CSRF protection
- Express Rate Limit

### Database

- PostgreSQL
- Prisma ORM

### Development Tools

- Git
- GitHub
- npm
- curl

## Project Structure


Project Hub/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── types/
│   └── package.json
│
├── server/
│   ├── migrations/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md