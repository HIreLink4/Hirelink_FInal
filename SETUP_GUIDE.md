# HireLink - Local Development Setup Guide

This guide provides detailed step-by-step instructions to build and run HireLink without Docker.

---

## 📋 Prerequisites

### 1. Java Development Kit (JDK 17+)
- Download: https://adoptium.net/temurin/releases/?version=17
- Verify installation:
  ```bash
  java -version
  # Should show: openjdk version "17.x.x" or higher
  ```

### 2. Apache Maven (3.8+)
- Download: https://maven.apache.org/download.cgi
- Add to PATH: Add `<maven-install-dir>/bin` to your system PATH
- Verify installation:
  ```bash
  mvn -version
  # Should show: Apache Maven 3.8.x or higher
  ```

### 3. Node.js (18+) and npm (9+)
- Download: https://nodejs.org/ (LTS version recommended)
- Verify installation:
  ```bash
  node -v   # Should show: v18.x.x or higher
  npm -v    # Should show: 9.x.x or higher
  ```

### 4. MySQL Server (8.0+)
- Download: https://dev.mysql.com/downloads/mysql/
- Or use XAMPP/WAMP/MAMP which includes MySQL
- Default port: 3306

---

## 🗄️ STEP 1: Database Configuration

### Option A: Fresh MySQL Installation

#### 1.1 Start MySQL Server
```bash
# Windows (if installed as service)
net start mysql

# Or start from MySQL Workbench / XAMPP Control Panel
```

#### 1.2 Connect to MySQL as Root
```bash
mysql -u root -p
# Enter your root password when prompted
```

#### 1.3 Create Database and User
```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS hirelink_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user (optional, you can use root)
CREATE USER IF NOT EXISTS 'hirelink_user'@'localhost' IDENTIFIED BY 'hirelink_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON hirelink_db.* TO 'hirelink_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
```

### Option B: Using XAMPP/WAMP

1. Start Apache and MySQL from the control panel
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Click "New" to create database named `hirelink_db`
4. Select `utf8mb4_unicode_ci` as collation

---

## 🌱 STEP 2: Database Initialization & Seeding

### 2.1 Initialize with Seed Data

```bash
# Navigate to project root
cd "E:\DEVELOPMENT\WEBSITE\ENSATE\ACADEMIC PROJECTS\HireLink"

# Run the init script
mysql -u root -p hirelink_db < database/init.sql
```

Or in MySQL client:
```sql
USE hirelink_db;
SOURCE E:/DEVELOPMENT/WEBSITE/ENSATE/ACADEMIC PROJECTS/HireLink/database/init.sql;
```

### 2.2 Verify Seed Data
```sql
USE hirelink_db;

-- Check categories
SELECT * FROM service_categories;

-- Check users
SELECT user_id, name, email, user_type FROM users;

-- Check providers
SELECT * FROM service_providers;

-- Check services
SELECT service_name, base_price FROM services;
```

### 📝 Demo User Credentials

**Password for all accounts:** `password123`

| User Type | Email | Phone |
|-----------|-------|-------|
| Customer | priya.sharma@email.com | 9876543210 |
| Customer | rahul.verma@email.com | 9876543211 |
| Provider (Electrical) | ramesh.electrician@email.com | 9876543220 |
| Provider (Plumbing) | suresh.plumber@email.com | 9876543221 |
| Provider (Carpentry) | mahesh.carpenter@email.com | 9876543222 |
| Provider (Cleaning) | lakshmi.cleaner@email.com | 9876543223 |
| Admin | admin@hirelink.in | 9876543230 |
| Super Admin | superadmin@hirelink.in | 9876543231 |

---

## ⚙️ STEP 3: Backend Configuration

### 3.1 Configure Database Connection

Edit `backend/src/main/resources/application.properties`:

```properties
# If using root user with password "password"
spring.datasource.url=jdbc:mysql://localhost:3306/hirelink_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=password

# If using custom user
spring.datasource.url=jdbc:mysql://localhost:3306/hirelink_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=hirelink_user
spring.datasource.password=hirelink_password
```

### 3.2 Using Environment Variables (Recommended)

Instead of editing the file, set environment variables:

**PowerShell:**
```powershell
$env:DATABASE_URL = "jdbc:mysql://localhost:3306/hirelink_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DATABASE_USERNAME = "root"
$env:DATABASE_PASSWORD = "your_mysql_password"
```

**Command Prompt:**
```cmd
set DATABASE_URL=jdbc:mysql://localhost:3306/hirelink_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
set DATABASE_USERNAME=root
set DATABASE_PASSWORD=your_mysql_password
```

**Linux/macOS:**
```bash
export DATABASE_URL="jdbc:mysql://localhost:3306/hirelink_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DATABASE_USERNAME="root"
export DATABASE_PASSWORD="your_mysql_password"
```

---

## 🔨 STEP 4: Build & Run Backend

### 4.1 Navigate to Backend Directory
```bash
cd "E:\DEVELOPMENT\WEBSITE\ENSATE\ACADEMIC PROJECTS\HireLink\backend"
```

### 4.2 Build the Application
```bash
# Clean and build
mvn clean install -DskipTests

# This will:
# - Download all dependencies
# - Compile Java code
# - Package into JAR file
```

### 4.3 Run the Backend
```bash
# Option 1: Using Maven (Development mode with hot reload)
mvn spring-boot:run

# Option 2: Run the JAR directly (Production mode)
java -jar target/hirelink-backend-1.0.0.jar
```

### 4.4 Verify Backend is Running
- API Base URL: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

**Test the API:**
```bash
# Get all categories
curl http://localhost:8080/api/categories

# Health check
curl http://localhost:8080/actuator/health
```

---

## 🎨 STEP 5: Build & Run Frontend

### 5.1 Navigate to Frontend Directory
```bash
cd "E:\DEVELOPMENT\WEBSITE\ENSATE\ACADEMIC PROJECTS\HireLink\frontend"
```

### 5.2 Install Dependencies
```bash
npm install
# or
npm install --legacy-peer-deps  # if you encounter peer dependency issues
```

### 5.3 Configure API URL

Create `.env` file in the frontend directory:
```bash
# frontend/.env
VITE_API_URL=http://localhost:8080/api
```

### 5.4 Run the Frontend
```bash
# Development mode with hot reload
npm run dev
```

### 5.5 Access the Application
- Frontend URL: http://localhost:5173
- The app will automatically connect to the backend at http://localhost:8080

---

## 🚀 Quick Start Commands (All-in-One)

### PowerShell Script
```powershell
# Save as start-hirelink.ps1

# Set database credentials
$env:DATABASE_PASSWORD = "your_mysql_password"

# Terminal 1: Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\DEVELOPMENT\WEBSITE\ENSATE\ACADEMIC PROJECTS\HireLink\backend'; mvn spring-boot:run"

# Wait for backend to start
Start-Sleep -Seconds 30

# Terminal 2: Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\DEVELOPMENT\WEBSITE\ENSATE\ACADEMIC PROJECTS\HireLink\frontend'; npm run dev"

Write-Host "HireLink is starting..."
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:5173"
```

---

## 🔍 Troubleshooting

### Backend Issues

#### "Connection refused" to MySQL
```bash
# Check if MySQL is running
# Windows
Get-Service -Name "*mysql*"

# Or check port
netstat -an | findstr "3306"
```

#### "Access denied for user 'root'@'localhost'"
- Verify password in `application.properties`
- Check MySQL user permissions

#### Port 8080 already in use
```bash
# Find and kill process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change port in application.properties
server.port=8081
```

### Frontend Issues

#### "EACCES permission denied"
```bash
# Fix npm permissions (Windows - run as admin)
npm cache clean --force
```

#### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### CORS errors
- Ensure backend is running on port 8080
- Check `cors.allowed-origins` in `application.properties`

---

## 📊 API Endpoints Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/refresh` | Refresh token | ❌ |
| GET | `/api/categories` | List all categories | ❌ |
| GET | `/api/categories/featured` | Featured categories | ❌ |
| GET | `/api/services/featured` | Featured services | ❌ |
| GET | `/api/providers/featured` | Featured providers | ❌ |
| GET | `/api/users/me` | Current user profile | ✅ |
| GET | `/api/bookings/my-bookings` | User's bookings | ✅ |
| POST | `/api/bookings` | Create booking | ✅ |

---

## 📁 Project Structure

```
HireLink/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/       # Java source code
│   │   └── com/hirelink/
│   │       ├── config/      # Configuration classes
│   │       ├── controller/  # REST Controllers
│   │       ├── dto/         # Data Transfer Objects
│   │       ├── entity/      # JPA Entities
│   │       ├── exception/   # Exception handlers
│   │       ├── repository/  # JPA Repositories
│   │       ├── security/    # Security config
│   │       └── service/     # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml              # Maven config
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # State management
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   ├── package.json         # npm config
│   └── vite.config.js       # Vite config
│
└── database/
    └── init.sql             # DB init & seed data
```

---

## ✅ Checklist

- [ ] JDK 17+ installed
- [ ] Maven 3.8+ installed  
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ running
- [ ] Database `hirelink_db` created
- [ ] Seed data loaded
- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can login with demo credentials

---

**Happy Coding! 🎉**

*HireLink - Academic Project - ENSATE 2026*
