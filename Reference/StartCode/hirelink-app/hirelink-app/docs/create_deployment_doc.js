const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, 
        LevelFormat, PageNumber, ShadingType, PageBreak } = require('docx');
const fs = require('fs');

// Color scheme
const COLORS = {
  primary: '1e3a5f',
  secondary: '4a90a4',
  accent: 'e87a25',
  text: '333333',
  lightGray: 'f5f5f5',
  mediumGray: 'cccccc'
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: COLORS.mediumGray };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: COLORS.primary, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: COLORS.primary, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: COLORS.secondary, font: "Arial" },
        paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: COLORS.text, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
      { id: "Code", name: "Code", basedOn: "Normal",
        run: { size: 18, font: "Courier New" },
        paragraph: { spacing: { before: 100, after: 100 } } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-prereq",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-local",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-docker",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-azure",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-railway",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ 
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "HireLink Deployment Guide", color: COLORS.secondary, size: 20 })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", size: 20 }), new TextRun({ children: [PageNumber.CURRENT], size: 20 }), new TextRun({ text: " of ", size: 20 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20 })]
      })] })
    },
    children: [
      // Title Page
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("HireLink")] }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        spacing: { after: 400 },
        children: [new TextRun({ text: "Build & Deployment Documentation", size: 32, color: COLORS.secondary })] 
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Local Service Provider Platform", size: 24, italics: true, color: COLORS.text })] 
      }),
      new Paragraph({ spacing: { before: 1000 } }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Version 1.0 | January 2026", size: 22, color: COLORS.text })] 
      }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Table of Contents Section
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Table of Contents")] }),
      new Paragraph({ children: [new TextRun({ text: "1. Introduction", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "2. System Requirements", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "3. Project Structure", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "4. Local Development Setup", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "5. Docker Deployment", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "6. Azure Cloud Deployment", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "7. Railway Deployment (Low Cost)", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "8. Environment Variables Reference", size: 22 })] }),
      new Paragraph({ children: [new TextRun({ text: "9. Troubleshooting Guide", size: 22 })] }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 1: Introduction
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Introduction")] }),
      new Paragraph({ 
        spacing: { after: 200 },
        children: [new TextRun("HireLink is a full-stack web application designed to connect customers with local service providers. The platform features a React 18.x frontend, Spring Boot 3.x backend, and MySQL 8.0 database.")] 
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Technology Stack")] }),
      new Table({
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Technology", bold: true, color: "FFFFFF" })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Frontend")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("React 18.x, Vite, TailwindCSS, React Query")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Backend")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Spring Boot 3.2.x, Java 17, Spring Security, JWT")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Database")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("MySQL 8.0")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Containerization")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Docker, Docker Compose")] })] })
          ]})
        ]
      }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 2: System Requirements
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. System Requirements")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Development Machine")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Operating System: Windows 10/11, macOS 12+, or Ubuntu 20.04+")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("RAM: Minimum 8GB (16GB recommended)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Storage: At least 10GB free space")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Internet connection for package downloads")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Required Software")] }),
      new Table({
        columnWidths: [2340, 2340, 4680],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Software", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Version", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Download URL", bold: true, color: "FFFFFF" })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Java JDK")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("17 LTS")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("adoptium.net")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Node.js")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("20.x LTS")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("nodejs.org")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Maven")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("3.9+")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("maven.apache.org")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("MySQL")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("8.0")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("mysql.com/downloads")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Docker")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("24.x")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("docker.com")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Git")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("2.40+")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("git-scm.com")] })] })
          ]})
        ]
      }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 3: Project Structure
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Project Structure")] }),
      new Paragraph({ 
        spacing: { after: 200 },
        children: [new TextRun("The HireLink project follows a standard monorepo structure with separate directories for frontend and backend:")] 
      }),
      
      new Paragraph({ style: "Code", children: [new TextRun("hirelink-app/")] }),
      new Paragraph({ style: "Code", children: [new TextRun("├── backend/                    # Spring Boot application")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   ├── src/main/java/         # Java source files")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   ├── src/main/resources/    # Configuration files")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   ├── pom.xml                # Maven dependencies")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   └── Dockerfile             # Backend container config")] }),
      new Paragraph({ style: "Code", children: [new TextRun("├── frontend/                   # React application")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   ├── src/                   # React source files")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   ├── package.json           # NPM dependencies")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   ├── vite.config.js         # Vite configuration")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   ├── nginx.conf             # Production web server")] }),
      new Paragraph({ style: "Code", children: [new TextRun("│   └── Dockerfile             # Frontend container config")] }),
      new Paragraph({ style: "Code", children: [new TextRun("├── docker-compose.yml          # Multi-container orchestration")] }),
      new Paragraph({ style: "Code", children: [new TextRun("└── .env.example                # Environment template")] }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 4: Local Development Setup
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Local Development Setup")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Database Setup")] }),
      new Paragraph({ children: [new TextRun("First, create the MySQL database and user:")] }),
      new Paragraph({ spacing: { before: 100 } }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("# Login to MySQL as root")] }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("mysql -u root -p")] }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("")] }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("# Create database and user")] }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("CREATE DATABASE hirelink_db;")] }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("CREATE USER 'hirelink'@'localhost' IDENTIFIED BY 'password';")] }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("GRANT ALL PRIVILEGES ON hirelink_db.* TO 'hirelink'@'localhost';")] }),
      new Paragraph({ style: "Code", shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [new TextRun("FLUSH PRIVILEGES;")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Backend Setup")] }),
      new Paragraph({ numbering: { reference: "numbered-local", level: 0 }, children: [new TextRun("Navigate to the backend directory:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("cd hirelink-app/backend")] }),
      
      new Paragraph({ numbering: { reference: "numbered-local", level: 0 }, children: [new TextRun("Update application.properties with your database credentials")] }),
      
      new Paragraph({ numbering: { reference: "numbered-local", level: 0 }, children: [new TextRun("Build the project:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("mvn clean install -DskipTests")] }),
      
      new Paragraph({ numbering: { reference: "numbered-local", level: 0 }, children: [new TextRun("Run the application:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("mvn spring-boot:run")] }),
      
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun("The backend will start at http://localhost:8080")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 Frontend Setup")] }),
      new Paragraph({ numbering: { reference: "numbered-prereq", level: 0 }, children: [new TextRun("Navigate to the frontend directory:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("cd hirelink-app/frontend")] }),
      
      new Paragraph({ numbering: { reference: "numbered-prereq", level: 0 }, children: [new TextRun("Install dependencies:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("npm install")] }),
      
      new Paragraph({ numbering: { reference: "numbered-prereq", level: 0 }, children: [new TextRun("Start development server:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("npm run dev")] }),
      
      new Paragraph({ spacing: { before: 100 }, children: [new TextRun("The frontend will start at http://localhost:3000")] }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 5: Docker Deployment
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Docker Deployment")] }),
      new Paragraph({ 
        spacing: { after: 200 },
        children: [new TextRun("Docker provides a consistent environment for deployment across different platforms.")] 
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Prerequisites")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Docker Engine 24.x or later")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Docker Compose v2.x")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("At least 4GB RAM allocated to Docker")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 Quick Start")] }),
      new Paragraph({ numbering: { reference: "numbered-docker", level: 0 }, children: [new TextRun("Clone or navigate to the project directory")] }),
      
      new Paragraph({ numbering: { reference: "numbered-docker", level: 0 }, children: [new TextRun("Copy and configure environment file:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("cp .env.example .env")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Edit .env with your preferred settings")] }),
      
      new Paragraph({ numbering: { reference: "numbered-docker", level: 0 }, children: [new TextRun("Build and start all services:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker-compose up -d --build")] }),
      
      new Paragraph({ numbering: { reference: "numbered-docker", level: 0 }, children: [new TextRun("Verify services are running:")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker-compose ps")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.3 Accessing the Application")] }),
      new Table({
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.secondary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Service", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.secondary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "URL", bold: true, color: "FFFFFF" })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Frontend")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("http://localhost")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Backend API")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("http://localhost:8080/api")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Swagger UI")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("http://localhost:8080/swagger-ui.html")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("MySQL")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("localhost:3306")] })] })
          ]})
        ]
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.4 Useful Docker Commands")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# View logs")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker-compose logs -f backend")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Stop all services")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker-compose down")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Remove all data (including database)")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker-compose down -v")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Rebuild specific service")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker-compose up -d --build backend")] }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 6: Azure Cloud Deployment
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Azure Cloud Deployment")] }),
      new Paragraph({ 
        spacing: { after: 200 },
        children: [new TextRun("This section covers deploying HireLink to Microsoft Azure using App Service for containers.")] 
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Azure Resources Required")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Azure Container Registry (ACR) - Store Docker images")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Azure App Service (Linux) - Host the application")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Azure Database for MySQL Flexible Server - Managed database")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 Step-by-Step Deployment")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Step 1: Create Azure Resources")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Login to Azure CLI")] }),
      new Paragraph({ style: "Code", children: [new TextRun("az login")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Create resource group")] }),
      new Paragraph({ style: "Code", children: [new TextRun("az group create --name hirelink-rg --location eastus")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Create container registry")] }),
      new Paragraph({ style: "Code", children: [new TextRun("az acr create --resource-group hirelink-rg --name hirelinkacr --sku Basic")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Step 2: Create MySQL Database")] }),
      new Paragraph({ style: "Code", children: [new TextRun("az mysql flexible-server create \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  --resource-group hirelink-rg \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  --name hirelink-mysql \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  --admin-user hirelinkadmin \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  --admin-password YOUR_SECURE_PASSWORD \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  --sku-name Standard_B1ms")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Step 3: Push Docker Images")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Login to ACR")] }),
      new Paragraph({ style: "Code", children: [new TextRun("az acr login --name hirelinkacr")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Build and push backend")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker build -t hirelinkacr.azurecr.io/hirelink-backend:latest ./backend")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker push hirelinkacr.azurecr.io/hirelink-backend:latest")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Build and push frontend")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker build -t hirelinkacr.azurecr.io/hirelink-frontend:latest ./frontend")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker push hirelinkacr.azurecr.io/hirelink-frontend:latest")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Step 4: Create App Service")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Create App Service Plan")] }),
      new Paragraph({ style: "Code", children: [new TextRun("az appservice plan create --name hirelink-plan --resource-group hirelink-rg \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  --is-linux --sku B1")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Create Web App for Backend")] }),
      new Paragraph({ style: "Code", children: [new TextRun("az webapp create --resource-group hirelink-rg --plan hirelink-plan \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  --name hirelink-api --deployment-container-image-name \\")] }),
      new Paragraph({ style: "Code", children: [new TextRun("  hirelinkacr.azurecr.io/hirelink-backend:latest")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 Azure Estimated Costs")] }),
      new Table({
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.accent, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Resource", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.accent, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Monthly Cost (USD)", bold: true, color: "FFFFFF" })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("App Service (B1)")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("~$13/month")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("MySQL Flexible (B1ms)")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("~$15/month")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Container Registry (Basic)")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("~$5/month")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Total Estimated", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "~$33-40/month", bold: true })] })] })
          ]})
        ]
      }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 7: Railway Deployment
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Railway Deployment (Low Cost Option)")] }),
      new Paragraph({ 
        spacing: { after: 200 },
        children: [new TextRun("Railway is a modern PaaS that offers simple deployment with a generous free tier, making it ideal for small projects and MVPs.")] 
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 Why Railway?")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Free tier: $5 credit/month (enough for small apps)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Simple GitHub integration - automatic deployments")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Built-in MySQL database provisioning")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("No credit card required to start")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("SSL certificates included")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 Deployment Steps")] }),
      new Paragraph({ numbering: { reference: "numbered-railway", level: 0 }, children: [new TextRun("Create an account at railway.app")] }),
      new Paragraph({ numbering: { reference: "numbered-railway", level: 0 }, children: [new TextRun("Create a new project from the dashboard")] }),
      new Paragraph({ numbering: { reference: "numbered-railway", level: 0 }, children: [new TextRun("Add a MySQL database service:")] }),
      new Paragraph({ children: [new TextRun("   Click 'New' → 'Database' → 'MySQL'")] }),
      new Paragraph({ numbering: { reference: "numbered-railway", level: 0 }, children: [new TextRun("Deploy the backend:")] }),
      new Paragraph({ children: [new TextRun("   Click 'New' → 'GitHub Repo' → Select your repository")] }),
      new Paragraph({ children: [new TextRun("   Set root directory to '/backend'")] }),
      new Paragraph({ numbering: { reference: "numbered-railway", level: 0 }, children: [new TextRun("Configure environment variables (see Section 8)")] }),
      new Paragraph({ numbering: { reference: "numbered-railway", level: 0 }, children: [new TextRun("Deploy the frontend as a separate service")] }),
      new Paragraph({ numbering: { reference: "numbered-railway", level: 0 }, children: [new TextRun("Generate domain for public access")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 Railway Environment Variables")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Backend service variables")] }),
      new Paragraph({ style: "Code", children: [new TextRun("DATABASE_URL=${{MySQL.MYSQL_URL}}")] }),
      new Paragraph({ style: "Code", children: [new TextRun("DATABASE_USERNAME=${{MySQL.MYSQLUSER}}")] }),
      new Paragraph({ style: "Code", children: [new TextRun("DATABASE_PASSWORD=${{MySQL.MYSQLPASSWORD}}")] }),
      new Paragraph({ style: "Code", children: [new TextRun("JWT_SECRET=your-secure-jwt-secret")] }),
      new Paragraph({ style: "Code", children: [new TextRun("CORS_ORIGINS=https://your-frontend.railway.app")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.4 Railway Pricing")] }),
      new Table({
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.secondary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Plan", bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.secondary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Cost", bold: true, color: "FFFFFF" })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Hobby (Free tier)")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("$5 credit/month (free)")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Pro")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("$20/month + usage")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Typical small app")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("$5-15/month")] })] })
          ]})
        ]
      }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 8: Environment Variables
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Environment Variables Reference")] }),
      new Paragraph({ 
        spacing: { after: 200 },
        children: [new TextRun("Complete reference of all environment variables used by HireLink.")] 
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 Backend Variables")] }),
      new Table({
        columnWidths: [3500, 2340, 3520],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Variable", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Required", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF", size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "DATABASE_URL", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Yes", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "JDBC connection string", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "DATABASE_USERNAME", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Yes", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Database username", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "DATABASE_PASSWORD", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Yes", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Database password", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "JWT_SECRET", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Yes", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "JWT signing key (min 256 bits)", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "PORT", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "No", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Server port (default: 8080)", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "CORS_ORIGINS", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "No", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Allowed CORS origins", size: 20 })] })] })
          ]})
        ]
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.2 Frontend Variables")] }),
      new Table({
        columnWidths: [3500, 2340, 3520],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Variable", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Required", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF", size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "VITE_API_URL", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "No", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Backend API URL (default: /api)", size: 20 })] })] })
          ]})
        ]
      }),
      
      new Paragraph({ children: [new PageBreak()] }),
      
      // Section 9: Troubleshooting
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Troubleshooting Guide")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.1 Common Issues")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Database Connection Failed")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Verify MySQL service is running")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Check DATABASE_URL format is correct")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Ensure firewall allows port 3306")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Verify user credentials and permissions")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("CORS Errors")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Update CORS_ORIGINS to include frontend URL")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Ensure protocol (http/https) matches")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Restart backend after configuration change")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Docker Build Fails")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Check Docker has sufficient memory (4GB+)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Clear Docker cache: docker system prune -a")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Verify Dockerfile syntax")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.2 Logging and Debugging")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# View Spring Boot logs")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker logs hirelink-backend -f")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Access MySQL shell")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker exec -it hirelink-mysql mysql -u root -p")] }),
      new Paragraph({ style: "Code", children: [new TextRun("")] }),
      new Paragraph({ style: "Code", children: [new TextRun("# Check container health")] }),
      new Paragraph({ style: "Code", children: [new TextRun("docker inspect --format='{{.State.Health.Status}}' hirelink-backend")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.3 Performance Tips")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Enable JPA query caching in production")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Use connection pooling (HikariCP is default)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Configure proper JVM heap size for container")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Enable gzip compression in nginx")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Use CDN for static assets in production")] }),
      
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "End of Document", italics: true, color: COLORS.text })] 
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/claude/hirelink-app/docs/HireLink_Deployment_Guide.docx", buffer);
  console.log("Deployment Guide created successfully!");
});
