\# Project Hub



A multi-tenant project management and ticket management platform inspired by tools like Jira and Asana.



Project Hub allows organizations to manage teams, projects, tasks, comments, and user access through role-based permissions. The application is built as a full-stack TypeScript application and deployed on AWS using EC2 and RDS PostgreSQL.



\## 1. Overview



Project Hub is designed around a multi-tenant architecture where users belong to organizations and access is isolated by organization.



The platform provides:



\* Organization-based multi-tenancy

\* Team and project management

\* Task and ticket management

\* Kanban-style task workflow

\* Role-based access control

\* Secure authentication using JWT and HTTP-only cookies

\* CSRF protection

\* Request validation

\* Rate limiting and security headers

\* PostgreSQL persistence

\* AWS-based production deployment



The project demonstrates full-stack application development, backend security, relational database design, and cloud deployment.



\## 2. Features



\### Authentication



\* User registration and login

\* JWT-based authentication

\* HTTP-only authentication cookies

\* Secure production cookies

\* Logout functionality

\* CSRF protection



\### Organization \& Multi-Tenancy



\* Organization-based user isolation

\* Users belong to organizations

\* Teams and projects are associated with organizations

\* Protected resources enforce tenant isolation



\### Role-Based Access Control



Supported roles:



\* \*\*Admin\*\*

\* \*\*Project Manager\*\*

\* \*\*Developer\*\*



Role-based middleware controls access to protected operations.



\### Teams



\* Create and manage teams

\* Add and remove team members

\* Associate teams with organizations



\### Projects



\* Create and manage projects

\* Assign project members

\* Associate projects with teams and organizations



\### Tasks \& Tickets



\* Create, update, and delete tasks

\* Task priorities

\* Task statuses

\* Task assignments

\* Kanban-style workflow

\* Drag-and-drop task management



Supported task statuses:



\* TODO

\* IN\_PROGRESS

\* IN\_REVIEW

\* DONE



Supported priorities:



\* LOW

\* MEDIUM

\* HIGH

\* URGENT



\### Comments



\* Add comments to tasks

\* Associate comments with users and tasks



\### Security



\* JWT authentication

\* HTTP-only cookies

\* CSRF protection

\* Role-based authorization

\* Tenant isolation

\* Request validation with Zod

\* Rate limiting

\* Helmet security headers

\* CORS configuration

\* Production HTTPS

\* Private RDS database access



\## 3. Tech Stack



\### Frontend



\* React

\* TypeScript

\* React Router

\* Tailwind CSS

\* dnd-kit

\* Vite



\### Backend



\* Node.js

\* Express

\* TypeScript

\* Zod

\* JWT

\* bcrypt

\* Helmet

\* express-rate-limit

\* cookie-parser

\* CORS



\### Database



\* PostgreSQL

\* Prisma ORM



\### Infrastructure \& Deployment



\* AWS EC2

\* AWS RDS for PostgreSQL

\* AWS IAM

\* AWS Security Groups

\* Nginx

\* Let's Encrypt

\* systemd



\### Development \& Version Control



\* Git

\* GitHub

\* npm

\* Windows CMD / Linux shell



\## 4. System Architecture



```text

&#x20;                        Internet

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │      Nginx      │

&#x20;                   │   HTTP → HTTPS  │

&#x20;                   │      :80/:443   │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │  Node.js +      │

&#x20;                   │    Express      │

&#x20;                   │    :3000        │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │ AWS RDS         │

&#x20;                   │ PostgreSQL      │

&#x20;                   │     :5432       │

&#x20;                   └─────────────────┘



&#x20;      AWS EC2

&#x20;      ├── Nginx

&#x20;      ├── Express API

&#x20;      └── React production build

```



\### 5. Application Architecture



```text

React Frontend

&#x20;     │

&#x20;     │ HTTPS / REST API

&#x20;     ▼

Express Backend

&#x20;     │

&#x20;     ├── Authentication

&#x20;     ├── Authorization / RBAC

&#x20;     ├── Tenant Isolation

&#x20;     ├── Validation

&#x20;     ├── CSRF Protection

&#x20;     ├── Rate Limiting

&#x20;     └── Business Logic

&#x20;            │

&#x20;            ▼

&#x20;      Prisma ORM

&#x20;            │

&#x20;            ▼

&#x20;     PostgreSQL / RDS

```



The application follows a layered architecture where the React frontend communicates with the Express backend through REST APIs. The backend handles authentication, authorization, validation, security middleware, and business logic before interacting with PostgreSQL through Prisma.



\## 6. Authentication \& Security



Project Hub implements multiple layers of application and infrastructure security.



\### Authentication



\* JWT-based authentication

\* Authentication tokens stored in HTTP-only cookies

\* Secure cookies enabled in production

\* Configurable token expiration



\### Authorization



Role-based access control is implemented for:



\* Admin

\* Project Manager

\* Developer



Protected routes verify both authentication and the user's permissions before allowing restricted operations.



\### CSRF Protection



Protected state-changing requests use CSRF protection through a CSRF token mechanism.



\### Tenant Isolation



Users and resources are associated with organizations. Protected backend operations verify organization membership to prevent users from accessing resources belonging to another organization.



\### Input Validation



Request data is validated using Zod before being processed by the application.



\### Rate Limiting



Rate limiting is applied to API requests, with stricter limits for authentication-related endpoints.



\### Security Headers



Helmet is used to provide HTTP security headers.



\### Production Security



\* HTTPS through Nginx and Let's Encrypt

\* HTTP → HTTPS redirection

\* Public access to Express port `3000` disabled

\* RDS PostgreSQL is not publicly accessible

\* EC2 Security Groups restrict network access

\* Secrets stored in environment variables



\## 7. Database Design



Project Hub uses PostgreSQL with Prisma for relational data management.



The core entity hierarchy is:



```text

Organization

&#x20;   │

&#x20;   ├── Users

&#x20;   │

&#x20;   ├── Teams

&#x20;   │      │

&#x20;   │      └── Team Members

&#x20;   │

&#x20;   └── Projects

&#x20;          │

&#x20;          ├── Project Members

&#x20;          │

&#x20;          └── Tasks

&#x20;                 │

&#x20;                 └── Comments

```



\### Core Entities



\* \*\*Organization\*\* — tenant boundary for application data

\* \*\*User\*\* — application users and their roles

\* \*\*Team\*\* — groups of users within an organization

\* \*\*TeamMember\*\* — team membership relationship

\* \*\*Project\*\* — projects belonging to an organization

\* \*\*ProjectMember\*\* — project membership relationship

\* \*\*Task\*\* — project work items/tickets

\* \*\*Comment\*\* — task-related discussions

\* \*\*AuditLog\*\* — records important application actions



Many-to-many relationships such as team membership and project membership are represented through dedicated relation tables.



\## 8. User Roles \& Permissions



Project Hub currently supports three user roles:



| Role                | Description                               |

| ------------------- | ----------------------------------------- |

| \*\*Admin\*\*           | Organization-level administrative access  |

| \*\*Project Manager\*\* | Manages projects and project-related work |

| \*\*Developer\*\*       | Works on assigned projects and tasks      |



Authorization is enforced on the backend through RBAC middleware rather than relying only on frontend restrictions.



This ensures that restricted operations cannot be accessed simply by bypassing the frontend.



\## 9. API Structure



The backend exposes REST API endpoints organized by resource:



```text

/api/auth

/api/users

/api/teams

/api/projects

/api/tasks

/api/comments

```



\### Authentication



```text

POST   /api/auth/register

POST   /api/auth/login

POST   /api/auth/logout

GET    /api/auth/csrf-token

```



\### Users



```text

GET    /api/users

...

```



\### Teams



```text

GET    /api/teams

POST   /api/teams

...

```



\### Projects



```text

GET    /api/projects

POST   /api/projects

...

```



\### Tasks



```text

GET    /api/tasks

POST   /api/tasks

...

```



\### Comments



```text

GET    /api/comments

POST   /api/comments

...

```



The API uses standard HTTP methods and JSON responses. Protected resources require authentication and tenant authorization.



\## 10. Deployment



The application is deployed on AWS using a minimal production architecture.



\### AWS Components



\* \*\*EC2\*\* — hosts Nginx, the Express backend, and the React production build

\* \*\*RDS PostgreSQL\*\* — managed relational database

\* \*\*Security Groups\*\* — control inbound and database access

\* \*\*IAM\*\* — AWS identity and access management



\### Reverse Proxy



Nginx sits in front of the Express server:



```text

Internet

&#x20;  │

&#x20;  ▼

Nginx :443

&#x20;  │

&#x20;  ▼

Express :3000

&#x20;  │

&#x20;  ▼

RDS PostgreSQL :5432

```



Express listens on the internal EC2 port while Nginx handles public HTTP/HTTPS traffic.



\### HTTPS



HTTPS is provided through Let's Encrypt.



HTTP requests are redirected to HTTPS, and certificate renewal is automated through a systemd timer.



\### Backend Process Management



The Express application runs as a systemd service, allowing the backend to start automatically and restart if necessary.



\## 11. Project Structure



```text

Project Hub/

│

├── client/

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── pages/

│   │   ├── api/

│   │   └── ...

│   ├── .env.production

│   └── package.json

│

├── server/

│   ├── src/

│   │   ├── config/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── routes/

│   │   └── ...

│   ├── prisma/

│   ├── .env

│   └── package.json

│

├── .gitignore

├── README.md

└── ...

```



\## 12. Local Setup



\### Prerequisites



Make sure the following are installed:



\* Node.js 22+

\* npm

\* PostgreSQL

\* Git



\### Clone the Repository



```bash

git clone https://github.com/Zishan-Khan01/Project-Hub.git

cd Project-Hub

```



\### Install Dependencies



Install frontend dependencies:



```bash

cd client

npm install

```



Install backend dependencies:



```bash

cd ../server

npm install

```



\### Configure Environment Variables



Create a `.env` file inside the `server` directory.



Example:



```env

NODE\_ENV=development

PORT=3000



DATABASE\_URL=your\_postgresql\_connection\_string



JWT\_SECRET=your\_jwt\_secret

JWT\_EXPIRES\_IN=7d



CSRF\_SECRET=your\_csrf\_secret



CLIENT\_URL=http://localhost:5173

```



For the frontend, create `.env.local` or configure the appropriate Vite environment file:



```env

VITE\_API\_URL=http://localhost:3000/api

```



Never commit actual secrets or production credentials to Git.



\### Run the Backend



From the `server` directory:



```bash

npm run dev

```



\### Run the Frontend



From the `client` directory:



```bash

npm run dev

```



The development application can then be accessed through the local Vite development server.



\## 13. Environment Variables



\### Backend



| Variable         | Purpose                        |

| ---------------- | ------------------------------ |

| `NODE\_ENV`       | Application environment        |

| `PORT`           | Express server port            |

| `DATABASE\_URL`   | PostgreSQL database connection |

| `JWT\_SECRET`     | JWT signing secret             |

| `JWT\_EXPIRES\_IN` | JWT expiration duration        |

| `CSRF\_SECRET`    | CSRF protection secret         |

| `CLIENT\_URL`     | Frontend origin                |



\### Frontend



| Variable       | Purpose              |

| -------------- | -------------------- |

| `VITE\_API\_URL` | Backend API base URL |



Production secrets are configured directly on the deployment environment and are not stored in the repository.



\## 14. Screenshots



Screenshots of the application can be added here to demonstrate the main user-facing functionality.



\### Login



\*Add login screenshot here.\*



\### Dashboard



\*Add dashboard screenshot here.\*



\### Kanban Board



\*Add Kanban board screenshot here.\*



\### Project \& Tasks



\*Add project/task screenshot here.\*



\## 15. Future Improvements



Potential future improvements include:



\* Automated test coverage

\* CI/CD pipeline

\* Custom domain

\* CloudFront/S3-based frontend hosting

\* AWS CloudWatch monitoring and alerting

\* Advanced project analytics

\* Additional notification features

\* More granular permissions

\* Enhanced production security policies



\## 16. Project Highlights



Project Hub demonstrates practical experience across the full application lifecycle:



\* Full-stack TypeScript development

\* REST API development

\* Relational database design

\* Authentication and authorization

\* Multi-tenant architecture

\* Application security

\* AWS infrastructure

\* Production deployment

\* Reverse proxy configuration

\* HTTPS configuration

\* Process management with systemd

\* Git and GitHub workflow



