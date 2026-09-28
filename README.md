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



