# HelpDesk — IT Support Ticketing System

A full-stack IT support ticketing system designed to manage technical support requests between employees, IT support teams, and administrators.

The application provides role-based workflows, ticket management, support conversations, activity tracking, and administrative user management.

## Features

### Employee
- Create IT support tickets
- View and track personal tickets
- Edit tickets while they are still open
- Communicate with IT Support after support responds
- Monitor ticket status and activity history

### IT Support
- View incoming support tickets
- Assign unassigned tickets to themselves
- Manage assigned tickets
- Update ticket status
- Communicate directly with employees
- Track ticket activity history

### Administrator
- View all support tickets
- Monitor system-wide ticket statistics
- Access administrative dashboard analytics
- Manage user roles
- View ticket conversations and activities
- Delete tickets

## Role-Based Access Control

The system provides three user roles:

| Role | Access |
| --- | --- |
| Employee | Create and manage personal support tickets |
| IT Support | Handle and resolve assigned support requests |
| Admin | Monitor the system and manage users |

Authorization is enforced on the backend using Spring Security rather than relying only on frontend route protection.

## Ticket Workflow

```text
Employee creates ticket
        ↓
Ticket status: Open
        ↓
IT Support assigns ticket
        ↓
Ticket status: In Progress
        ↓
IT Support starts conversation
        ↓
Employee can respond
        ↓
Issue is handled
        ↓
Ticket status: Resolved
```

Ticket activities such as creation, assignment, editing, status changes, and conversations are recorded to provide a clear support history.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- JavaScript
- CSS

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- BCrypt Password Hashing
- Spring Data JPA / Hibernate

### Database
- MySQL

## Security

The application includes:

- JWT-based authentication
- BCrypt password hashing
- Backend role-based authorization
- Protected API endpoints
- Protected frontend routes
- Ticket ownership validation
- Role-specific ticket access
- Environment variables for sensitive configuration

Sensitive values such as the database password and JWT signing secret are not stored directly in the repository.

## Portfolio Demo

The login page includes Quick Demo Login options for exploring the application using different roles:

- Employee
- IT Support
- Admin

Demo accounts are intended only for portfolio demonstration purposes.

## Project Structure

```text
helpdesk-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/main/java/com/helpdesk/backend/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── model/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/
│   └── pom.xml
│
├── .gitignore
└── README.md
```

## Running Locally

### Prerequisites

Make sure the following are installed:

- Node.js
- Java 21
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/megasekarl16-png/helpdesk-it-support-system.git
cd helpdesk-it-support-system
```

### 2. Create the Database

Create a MySQL database:

```sql
CREATE DATABASE helpdesk_db;
```

### 3. Configure Environment Variables

The backend requires:

```text
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret
```

The database username is configured as `root` for local development and can be changed in `application.properties` if needed.

### 4. Run the Backend

Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### 5. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Main API Areas

```text
/api/auth
/api/tickets
/api/tickets/{id}/comments
/api/tickets/{id}/activities
/api/admin/users
```

Access to protected endpoints depends on the authenticated user's role and ticket ownership.

## Screenshots

Screenshots and live demo information will be added after deployment.

## Future Improvements

Possible future improvements include:

- Advanced reporting and analytics
- Email notifications
- File attachments for support tickets
- Password recovery
- SLA monitoring
- Automated ticket assignment
- Expanded knowledge base management

## Author

**Mega Fauziah SekarLangit**

Informatics Engineering Student  
Universitas Esa Unggul

GitHub: [megasekarl16-png](https://github.com/megasekarl16-png)
