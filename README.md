\# Project Hub



A multi-tenant project management and ticket management platform inspired by tools like Jira and Asana.



Project Hub allows organizations to manage teams, projects, tasks, comments, and user access through role-based permissions.



\## 1. Overview



Project Hub is a full-stack project management platform built around a multi-tenant architecture.



Users belong to organizations, and access to protected resources is isolated by organization.



The platform provides:



\* Organization-based multi-tenancy

\* Team and project management

\* Task and ticket management

\* Kanban-style task workflow

\* Role-based access control

\* JWT authentication

\* HTTP-only authentication cookies

\* CSRF protection

\* Request validation

\* Rate limiting

\* PostgreSQL persistence

\* AWS production deployment



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

\* Teams and projects associated with organizations

\* Protected resources enforce tenant isolation



\### Role-Based Access Control



Supported roles:



\* Admin

\* Project Manager

\* Developer



Authorization is enforced on the backend.



\### Teams



\* Create and manage teams

\* Add and remove team members

\* Associate teams with organizations



\### Projects



\* Create and manage projects

\* Assign project members

\* Associate projects with organizations



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

\* Zod request validation

\* Rate limiting

\* Helmet security headers

\* CORS configuration

\* HTTPS

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



\## 4. System Architecture



```text

&#x20;                        Internet

&#x20;                            |

&#x20;                            v

&#x20;                   +-----------------+

&#x20;                   |      Nginx      |

&#x20;                   |   HTTP -> HTTPS |

&#x20;                   |     :80/:443    |

&#x20;                   +--------+--------+

&#x20;                            |

&#x20;                            v

&#x20;                   +-----------------+

&#x20;                   |   Node.js +     |

&#x20;                   |     Express     |

&#x20;                   |      :3000      |

&#x20;                   +--------+--------+

&#x20;                            |

&#x20;                            v

&#x20;                   +-----------------+

&#x20;                   |    AWS RDS      |

&#x20;                   |   PostgreSQL    |

&#x20;                   |      :5432      |

&#x20;                   +-----------------+



AWS EC2

|

+-- Nginx

+-- Express API

+-- React production build

```



\## 5. Application Architecture



```text

React Frontend

&#x20;     |

&#x20;     | HTTPS / REST API

&#x20;     v

Express Backend

&#x20;     |

&#x20;     +-- Authentication

&#x20;     +-- Authorization / RBAC

&#x20;     +-- Tenant Isolation

&#x20;     +-- Validation

&#x20;     +-- CSRF Protection

&#x20;     +-- Rate Limiting

&#x20;     +-- Business Logic

&#x20;            |

&#x20;            v

&#x20;       Prisma ORM

&#x20;            |

&#x20;            v

&#x20;      PostgreSQL / RDS

```



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



Protected routes verify authentication and permissions before allowing restricted operations.



\### CSRF Protection



Protected state-changing requests use CSRF protection through a CSRF token mechanism.



\### Tenant Isolation



Users and resources are associated with organizations. Protected backend operations verify organization membership to prevent access to resources belonging to another organization.



\### Input Validation



Request data is validated using Zod before being processed by the application.



\### Rate Limiting



Rate limiting is applied to API requests, with stricter limits for authentication-related endpoints.



\### Security Headers



Helmet is used to provide HTTP security headers.



\### Production Security



\* HTTPS through Nginx and Let's Encrypt

\* HTTP to HTTPS redirection

\* Express port 3000 is not publicly exposed

\* RDS PostgreSQL is not publicly accessible

\* EC2 Security Groups restrict network access

\* Secrets are stored in environment variables



\## 7. Database Design



Project Hub uses PostgreSQL with Prisma for relational data management.



The core entity hierarchy is:



```text

Organization

&#x20;   |

&#x20;   +-- Users

&#x20;   |

&#x20;   +-- Teams

&#x20;   |     |

&#x20;   |     +-- Team Members

&#x20;   |

&#x20;   +-- Projects

&#x20;         |

&#x20;         +-- Project Members

&#x20;         |

&#x20;         +-- Tasks

&#x20;               |

&#x20;               +-- Comments

```



Core entities include:



\* Organization

\* User

\* Team

\* TeamMember

\* Project

\* ProjectMember

\* Task

\* Comment

\* AuditLog



Many-to-many relationships such as team membership and project membership are represented through dedicated relation tables.



\## 8. User Roles \& Permissions



Project Hub supports three user roles:



| Role            | Description                               |

| --------------- | ----------------------------------------- |

| Admin           | Organization-level administrative access  |

| Project Manager | Manages projects and project-related work |

| Developer       | Works on assigned projects and tasks      |



Authorization is enforced on the backend through RBAC middleware rather than relying only on frontend restrictions.



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



Authentication endpoints include:



```text

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET  /api/auth/csrf-token

```



Protected resources require authentication and tenant authorization.



The API uses standard HTTP methods and JSON responses.



\## 10. AWS Deployment



The application is deployed on AWS using a minimal production architecture.



\### AWS Components



\* EC2 hosts Nginx, the Express backend, and the React production build.

\* RDS PostgreSQL provides managed relational database storage.

\* Security Groups control network access.

\* IAM provides AWS identity and access management.



\### Reverse Proxy



```text

Internet

&#x20;  |

&#x20;  v

Nginx :443

&#x20;  |

&#x20;  v

Express :3000

&#x20;  |

&#x20;  v

RDS PostgreSQL :5432

```



\### HTTPS



HTTPS is provided through Let's Encrypt.



HTTP requests are redirected to HTTPS, and certificate renewal is automated through a systemd timer.



\### Backend Process Management



The Express application runs as a systemd service, allowing the backend to start automatically and restart if necessary.



\## 11. Project Structure



```text

Project Hub/

|

+-- client/

|   +-- src/

|   |   +-- components/

|   |   +-- context/

|   |   +-- pages/

|   |   +-- api/

|   |   +-- ...

|   |

|   +-- .env.production

|   +-- package.json

|

+-- server/

|   +-- src/

|   |   +-- config/

|   |   +-- controllers/

|   |   +-- middleware/

|   |   +-- routes/

|   |   +-- ...

|   |

|   +-- prisma/

|   +-- .env

|   +-- package.json

|

+-- .gitignore

+-- README.md

```



\## 12. Local Setup



\### Prerequisites



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



Frontend:



```bash

cd client

npm install

```



Backend:



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



For the frontend:



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



\## 13. Environment Variables



\### Backend



| Variable       | Purpose                        |

| -------------- | ------------------------------ |

| NODE\_ENV       | Application environment        |

| PORT           | Express server port            |

| DATABASE\_URL   | PostgreSQL database connection |

| JWT\_SECRET     | JWT signing secret             |

| JWT\_EXPIRES\_IN | JWT expiration duration        |

| CSRF\_SECRET    | CSRF protection secret         |

| CLIENT\_URL     | Frontend origin                |



\### Frontend



| Variable     | Purpose              |

| ------------ | -------------------- |

| VITE\_API\_URL | Backend API base URL |



Production secrets are configured directly on the deployment environment and are not stored in the repository.



\## 14. Screenshots



Screenshots of the application can be added here.



\### Login



\*Add login screenshot here.\*



\### Dashboard



\*Add dashboard screenshot here.\*



\### Kanban Board



\*Add Kanban board screenshot here.\*



\### Project \& Tasks



\*Add project and task screenshot here.\*



\## 15. Future Improvements



Potential future improvements include:



\* Automated test coverage

\* CI/CD pipeline

\* Custom domain

\* CloudFront/S3-based frontend hosting

\* CloudWatch monitoring and alerting

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

\* Nginx reverse proxy configuration

\* HTTPS configuration

\* Process management with systemd

\* Git and GitHub workflow



