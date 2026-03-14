# ============================================================================
# HireLink - Local Development Startup Script
# Academic Project - ENSATE 2026
# ============================================================================

param(
    [string]$DatabasePassword = "",
    [switch]$SkipDatabase,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Help
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Banner {
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                                                           ║" -ForegroundColor Cyan
    Write-Host "  ║   " -ForegroundColor Cyan -NoNewline
    Write-Host "██╗  ██╗██╗██████╗ ███████╗██╗     ██╗███╗   ██╗██╗  ██╗" -ForegroundColor Yellow -NoNewline
    Write-Host "   ║" -ForegroundColor Cyan
    Write-Host "  ║   " -ForegroundColor Cyan -NoNewline
    Write-Host "██║  ██║██║██╔══██╗██╔════╝██║     ██║████╗  ██║██║ ██╔╝" -ForegroundColor Yellow -NoNewline
    Write-Host "   ║" -ForegroundColor Cyan
    Write-Host "  ║   " -ForegroundColor Cyan -NoNewline
    Write-Host "███████║██║██████╔╝█████╗  ██║     ██║██╔██╗ ██║█████╔╝ " -ForegroundColor Yellow -NoNewline
    Write-Host "   ║" -ForegroundColor Cyan
    Write-Host "  ║   " -ForegroundColor Cyan -NoNewline
    Write-Host "██╔══██║██║██╔══██╗██╔══╝  ██║     ██║██║╚██╗██║██╔═██╗ " -ForegroundColor Yellow -NoNewline
    Write-Host "   ║" -ForegroundColor Cyan
    Write-Host "  ║   " -ForegroundColor Cyan -NoNewline
    Write-Host "██║  ██║██║██║  ██║███████╗███████╗██║██║ ╚████║██║  ██╗" -ForegroundColor Yellow -NoNewline
    Write-Host "   ║" -ForegroundColor Cyan
    Write-Host "  ║   " -ForegroundColor Cyan -NoNewline
    Write-Host "╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝" -ForegroundColor Yellow -NoNewline
    Write-Host "   ║" -ForegroundColor Cyan
    Write-Host "  ║                                                           ║" -ForegroundColor Cyan
    Write-Host "  ║           Local Service Provider Platform                 ║" -ForegroundColor Cyan
    Write-Host "  ║                  ENSATE 2026                              ║" -ForegroundColor Cyan
    Write-Host "  ╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Show-Banner
    Write-Host "USAGE:" -ForegroundColor Green
    Write-Host "  .\start-hirelink.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Green
    Write-Host "  -DatabasePassword <password>  MySQL root password"
    Write-Host "  -SkipDatabase                 Skip database initialization"
    Write-Host "  -BackendOnly                  Start only the backend"
    Write-Host "  -FrontendOnly                 Start only the frontend"
    Write-Host "  -Help                         Show this help message"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Green
    Write-Host "  .\start-hirelink.ps1 -DatabasePassword mypassword"
    Write-Host "  .\start-hirelink.ps1 -SkipDatabase"
    Write-Host "  .\start-hirelink.ps1 -BackendOnly"
    Write-Host ""
    Write-Host "DEMO CREDENTIALS:" -ForegroundColor Green
    Write-Host "  Password: password123"
    Write-Host "  Customer: 9876543210"
    Write-Host "  Provider: 9876543220"
    Write-Host "  Admin:    9876543230"
    Write-Host ""
}

function Test-Command($Command) {
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    Write-Host ""
    
    $allGood = $true
    
    # Check Java
    if (Test-Command "java") {
        $javaVersion = (java -version 2>&1 | Select-String -Pattern 'version "(\d+)' | ForEach-Object { $_.Matches.Groups[1].Value })
        if ([int]$javaVersion -ge 17) {
            Write-Host "  [✓] Java $javaVersion" -ForegroundColor Green
        } else {
            Write-Host "  [✗] Java 17+ required (found: $javaVersion)" -ForegroundColor Red
            $allGood = $false
        }
    } else {
        Write-Host "  [✗] Java not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check Maven
    if (Test-Command "mvn") {
        $mvnVersion = (mvn -version 2>&1 | Select-String -Pattern 'Apache Maven (\d+\.\d+)' | ForEach-Object { $_.Matches.Groups[1].Value })
        Write-Host "  [✓] Maven $mvnVersion" -ForegroundColor Green
    } else {
        Write-Host "  [✗] Maven not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check Node.js
    if (Test-Command "node") {
        $nodeVersion = (node -v 2>&1).Trim()
        Write-Host "  [✓] Node.js $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "  [✗] Node.js not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check npm
    if (Test-Command "npm") {
        $npmVersion = (npm -v 2>&1).Trim()
        Write-Host "  [✓] npm $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "  [✗] npm not found" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check MySQL
    if (Test-Command "mysql") {
        Write-Host "  [✓] MySQL client found" -ForegroundColor Green
    } else {
        Write-Host "  [!] MySQL client not in PATH (optional)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    return $allGood
}

function Initialize-Database {
    param([string]$Password)
    
    Write-Host "Initializing database..." -ForegroundColor Yellow
    
    if (-not (Test-Command "mysql")) {
        Write-Host "  [!] MySQL client not found. Please initialize database manually." -ForegroundColor Yellow
        Write-Host "      Run: mysql -u root -p hirelink_db < database/init.sql" -ForegroundColor Gray
        return
    }
    
    $scriptPath = Join-Path $PSScriptRoot "database\init.sql"
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "  [✗] init.sql not found at: $scriptPath" -ForegroundColor Red
        return
    }
    
    try {
        if ($Password) {
            $result = mysql -u root -p"$Password" -e "CREATE DATABASE IF NOT EXISTS hirelink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
            $result = mysql -u root -p"$Password" hirelink_db -e "source $scriptPath" 2>&1
        } else {
            Write-Host "  Enter MySQL root password when prompted..." -ForegroundColor Gray
            mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS hirelink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            mysql -u root -p hirelink_db -e "source $scriptPath"
        }
        Write-Host "  [✓] Database initialized with seed data" -ForegroundColor Green
    } catch {
        Write-Host "  [✗] Database initialization failed: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Start-Backend {
    param([string]$Password)
    
    Write-Host "Starting Backend..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $PSScriptRoot "backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "  [✗] Backend directory not found" -ForegroundColor Red
        return
    }
    
    # Set environment variables
    $env:DATABASE_URL = "jdbc:mysql://localhost:3306/hirelink_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true"
    $env:DATABASE_USERNAME = "root"
    if ($Password) {
        $env:DATABASE_PASSWORD = $Password
    }
    
    # Start backend in new terminal
    $backendCmd = "cd '$backendPath'; Write-Host 'Building and starting HireLink Backend...' -ForegroundColor Cyan; mvn spring-boot:run"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
    
    Write-Host "  [✓] Backend starting in new terminal..." -ForegroundColor Green
    Write-Host "      URL: http://localhost:8080" -ForegroundColor Gray
    Write-Host "      Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor Gray
    Write-Host ""
}

function Start-Frontend {
    Write-Host "Starting Frontend..." -ForegroundColor Yellow
    
    $frontendPath = Join-Path $PSScriptRoot "frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "  [✗] Frontend directory not found" -ForegroundColor Red
        return
    }
    
    # Check if node_modules exists
    $nodeModulesPath = Join-Path $frontendPath "node_modules"
    
    if (-not (Test-Path $nodeModulesPath)) {
        $installCmd = "npm install --legacy-peer-deps; "
    } else {
        $installCmd = ""
    }
    
    # Start frontend in new terminal
    $frontendCmd = "cd '$frontendPath'; Write-Host 'Starting HireLink Frontend...' -ForegroundColor Cyan; ${installCmd}npm run dev"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
    
    Write-Host "  [✓] Frontend starting in new terminal..." -ForegroundColor Green
    Write-Host "      URL: http://localhost:5173" -ForegroundColor Gray
    Write-Host ""
}

function Show-Summary {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  HireLink is starting! Please wait for services to initialize." -ForegroundColor Green
    Write-Host ""
    Write-Host "  SERVICES:" -ForegroundColor Yellow
    Write-Host "    Frontend:  http://localhost:5173"
    Write-Host "    Backend:   http://localhost:8080"
    Write-Host "    Swagger:   http://localhost:8080/swagger-ui.html"
    Write-Host ""
    Write-Host "  DEMO LOGIN:" -ForegroundColor Yellow
    Write-Host "    Password:  password123"
    Write-Host "    Customer:  9876543210"
    Write-Host "    Provider:  9876543220"
    Write-Host "    Admin:     9876543230"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

# ============================================================================
# Main Script
# ============================================================================

if ($Help) {
    Show-Help
    exit 0
}

Show-Banner

# Check prerequisites
if (-not (Test-Prerequisites)) {
    Write-Host "Please install missing prerequisites and try again." -ForegroundColor Red
    exit 1
}

# Prompt for password if not provided and not skipping database
if (-not $SkipDatabase -and -not $DatabasePassword -and -not $FrontendOnly) {
    $securePassword = Read-Host "Enter MySQL root password (or press Enter to skip DB init)" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $DatabasePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

# Initialize database
if (-not $SkipDatabase -and -not $FrontendOnly -and $DatabasePassword) {
    Initialize-Database -Password $DatabasePassword
}

# Start services
if ($BackendOnly) {
    Start-Backend -Password $DatabasePassword
} elseif ($FrontendOnly) {
    Start-Frontend
} else {
    Start-Backend -Password $DatabasePassword
    
    Write-Host "Waiting 15 seconds for backend to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    Start-Frontend
}

Show-Summary
