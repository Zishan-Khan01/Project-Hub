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



