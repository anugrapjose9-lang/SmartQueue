# SmartQueue — Priority-Based Smart Queue Management System

SmartQueue is a web-based queue management application built with Java Spring Boot and MySQL. It allows customers to register, log in, create service tickets, and track their queue, while staff can manage tickets through a dedicated dashboard.

The system prioritizes customers based on urgency, ensuring **HIGH-priority tickets are served before NORMAL and LOW-priority tickets**. Tickets with the same priority are ordered by arrival time.

## Features

### Customer
- Customer registration and login
- Create service tickets
- Receive a unique ticket number
- View waiting tickets and queue status
- Track ticket progress

### Staff
- Dedicated staff login
- Staff dashboard with ticket statistics
- View waiting tickets
- Serve the next ticket according to priority
- Mark tickets as completed

### Queue Priority
Tickets are served in this order:

1. **HIGH**
2. **NORMAL**
3. **LOW**

For tickets with the same priority, earlier arrival time takes precedence.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Java, Spring Boot |
| Database | MySQL |
| Security | Spring Security, JWT authentication |
| Data access | Spring Data JPA / Hibernate |
| Frontend | HTML, CSS, JavaScript, Bootstrap |
| Build tool | Maven |
| Version control | Git and GitHub |

## Project Structure

```text
SmartQueue/
├── frontend/
│   ├── auth.js
│   ├── index.html
│   ├── login.html
│   ├── script.js
│   ├── staff.html
│   ├── staff.js
│   └── style.css
├── src/
│   ├── main/
│   │   ├── java/com/smartqueue/smartqueue/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   └── resources/
│   └── test/
├── pom.xml
└── README.md
```

## Prerequisites

Install the following before running the application:

- Java Development Kit (JDK)
- MySQL Server
- Git
- A web browser
- Visual Studio Code or another IDE

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/anugrapjose9-lang/SmartQueue.git
cd SmartQueue
```

### 2. Configure MySQL

Create a database in MySQL:

```sql
CREATE DATABASE smartqueue;
```

Configure your database connection in `src/main/resources/application.properties` with your local MySQL URL, username, and password.

Do not commit real database credentials or secret keys to GitHub.

### 3. Configure the staff account

Set the staff name, email, and password using the application's configuration properties or environment variables. The application initializes the staff account if it does not already exist.

Use a strong password and keep it private.

### 4. Run the backend

From the directory containing `pom.xml`, execute:

```bash
mvn spring-boot:run
```

The backend should start on port `8080`, unless configured otherwise.

### 5. Run the frontend

Open the `frontend` folder in Visual Studio Code and launch `login.html` using the Live Server extension.

The frontend is expected to run at `http://127.0.0.1:5500`. Ensure the frontend origin matches the CORS configuration in the backend.

## Application Workflow

1. A customer registers and logs in.
2. The customer creates a service ticket.
3. The ticket is added to the waiting queue.
4. The system ranks waiting tickets by priority and arrival time.
5. Staff serves the next eligible ticket.
6. Staff marks the ticket as completed.

## Future Enhancements

- Automatic queue refresh
- Estimated waiting-time calculations
- Notifications when a ticket is approaching service
- Queue analytics and reporting
- Additional automated tests

## Author

**Anugra P Jose**

Computer Science and Engineering Student

## License

This project is available for learning and portfolio demonstration. A formal open-source license can be added if the project is intended for reuse or redistribution.
