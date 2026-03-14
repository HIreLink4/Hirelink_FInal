# HireLink - Local Service Provider Platform

A full-stack web application connecting customers with verified local service providers for home services like electrical, plumbing, cleaning, and more.

**🎓 Academic Project - ENSATE 2026**

![HireLink Banner](https://via.placeholder.com/800x200?text=HireLink+-+Local+Service+Providers)

##  Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, TailwindCSS, React Query, Zustand |
| Backend | Spring Boot 3.2, Java 17, Spring Security, JWT |
| Database | MySQL 8.0 |
| Container | Docker, Docker Compose |

## 📋 Prerequisites

- **Java JDK 17** - [Download](https://adoptium.net/)
- **Node.js 20.x** - [Download](https://nodejs.org/)
- **Maven 3.9+** - [Download](https://maven.apache.org/)
- **MySQL 8.0** - [Download](https://mysql.com/downloads/)
- **Docker** (optional) - [Download](https://docker.com/)

## 🏃 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080/api
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Option 2: Local Development

#### 1. Database Setup
```sql
-- Login to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE hirelink_db;
CREATE USER 'hirelink'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON hirelink_db.* TO 'hirelink'@'localhost';
FLUSH PRIVILEGES;

-- Load seed data
SOURCE database/init.sql;
```

#### 2. Backend Setup
```bash
cd backend

# Update application.properties with your DB credentials

# Build and run
mvn clean install -DskipTests
mvn spring-boot:run

# Backend runs at http://localhost:8080
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs at http://localhost:3000
```

## 📁 Project Structure

```
hirelink/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/hirelink/
│   │   ├── config/            # Configuration classes
│   │   ├── controller/        # REST controllers
│   │   ├── dto/               # Data transfer objects
│   │   ├── entity/            # JPA entities
│   │   ├── exception/         # Exception handling
│   │   ├── repository/        # Data repositories
│   │   ├── security/          # Security configuration
│   │   └── service/           # Business logic
│   └── src/main/resources/
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── context/           # State management
│   └── public/
├── database/                   # SQL scripts
├── docker-compose.yml
└── README.md
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/categories` | GET | List all categories |
| `/api/services/{id}` | GET | Get service details |
| `/api/services/search` | GET | Search services |
| `/api/providers/{id}` | GET | Get provider profile |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/my-bookings` | GET | User's bookings |

Full API documentation available at `/swagger-ui.html`

## 🔐 Demo Accounts

**Password for all accounts:** `password123`

### Customers
| Name | Email | Phone |
|------|-------|-------|
| Priya Sharma | priya.sharma@email.com | 9876543210 |
| Rahul Verma | rahul.verma@email.com | 9876543211 |
| Ananya Iyer | ananya.iyer@email.com | 9876543212 |
| Vikram Singh | vikram.singh@email.com | 9876543213 |
| Meera Patel | meera.patel@email.com | 9876543214 |

### Service Providers
| Name | Specialty | Email | Phone |
|------|-----------|-------|-------|
| Ramesh Kumar | Electrical | ramesh.electrician@email.com | 9876543220 |
| Suresh Yadav | Plumbing | suresh.plumber@email.com | 9876543221 |
| Mahesh Sharma | Carpentry | mahesh.carpenter@email.com | 9876543222 |
| Lakshmi Devi | Cleaning | lakshmi.cleaner@email.com | 9876543223 |
| Ravi Prasad | Painting | ravi.painter@email.com | 9876543224 |
| Gopal Menon | AC & Appliance | gopal.ac@email.com | 9876543225 |

### Administrators
| Role | Email | Phone |
|------|-------|-------|
| Admin | admin@hirelink.in | 9876543230 |
| Super Admin | superadmin@hirelink.in | 9876543231 |

## ✨ Features

### For Customers
- Browse service categories
- Search for services
- View provider profiles and ratings
- Book services with date/time selection
- Track booking status
- Rate and review completed services

### For Providers
- Manage service listings
- Accept/reject bookings
- Update availability status
- View booking history
- Respond to reviews

## 🎨 UI Features

- Modern, responsive design
- Beautiful gradients and animations
- Dark-themed toast notifications
- Mobile-first approach
- Accessible components

## 📝 License

This project is for academic purposes only - ENSATE 2026.

## 👥 Team

HireLink - Graduate Academic Project

---

**Note:** This is an academic project. For production deployment, ensure proper security measures, SSL certificates, and environment-specific configurations are in place.
