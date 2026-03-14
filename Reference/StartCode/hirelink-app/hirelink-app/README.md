# HireLink - Local Service Provider Platform

A full-stack web application connecting customers with verified local service providers for home services like electrical, plumbing, cleaning, and more.

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18.x, Vite, TailwindCSS, React Query, Zustand |
| Backend | Spring Boot 3.2.x, Java 17, Spring Security, JWT |
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
# Clone the repository
git clone <repository-url>
cd hirelink-app

# Configure environment
cp .env.example .env
# Edit .env with your settings

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
```

#### 2. Backend Setup
```bash
cd backend

# Update src/main/resources/application.properties with your DB credentials

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
hirelink-app/
├── backend/                    # Spring Boot application
│   ├── src/main/java/
│   │   └── com/hirelink/
│   │       ├── config/        # Configuration classes
│   │       ├── controller/    # REST controllers
│   │       ├── dto/           # Data transfer objects
│   │       ├── entity/        # JPA entities
│   │       ├── exception/     # Exception handling
│   │       ├── repository/    # Data repositories
│   │       ├── security/      # Security configuration
│   │       └── service/       # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── context/           # State management
│   │   └── hooks/             # Custom hooks
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/
│   └── init/                  # SQL init scripts
├── docs/                      # Documentation
├── docker-compose.yml
└── .env.example
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | JDBC connection string | `jdbc:mysql://localhost:3306/hirelink_db` |
| `DATABASE_USERNAME` | Database username | `root` |
| `DATABASE_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT signing key (min 256 bits) | - |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `PORT` | Server port | `8080` |

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/categories` | GET | List all categories |
| `/api/services/{id}` | GET | Get service details |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/my-bookings` | GET | User's bookings |

Full API documentation available at `/swagger-ui.html`

## ☁️ Cloud Deployment

### Railway (Low Cost - Recommended for MVPs)
- Free tier: $5 credit/month
- Simple GitHub integration
- Built-in MySQL provisioning
- See `docs/HireLink_Deployment_Guide.docx` for details

### Azure
- App Service for containers
- Azure Database for MySQL
- Estimated cost: $33-40/month

## 📄 Documentation

- [Deployment Guide](docs/HireLink_Deployment_Guide.docx) - Complete build and deployment instructions
- [Database Schema](database/init/01_schema.sql) - MySQL schema with all tables
- [API Documentation](http://localhost:8080/swagger-ui.html) - Swagger UI (when running)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for academic purposes.

## 👥 Team

HireLink - Graduate Academic Project

---

**Note:** This is an academic project. For production deployment, ensure proper security measures, SSL certificates, and environment-specific configurations are in place.
