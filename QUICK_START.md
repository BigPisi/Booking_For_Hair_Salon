# Quick Start Guide

## Step 1: Setup Database

1. **Create the database** (if not already created):
```bash
psql -U postgres -c "CREATE DATABASE salon_booking;"
```

2. **Run the schema file** to create tables and sample data:
```bash
psql -U postgres -d salon_booking -f database/schema.sql
```

**Note:** If you get a permission error, you might need to:
- Check your PostgreSQL username (default is often `postgres`)
- Update the credentials in `backend/src/main/resources/application.properties` if different
- The default config expects: username=`postgres`, password=`postgres`

## Step 2: Start the Backend

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Build the project:**
```bash
mvn clean install
```

3. **Run the Spring Boot application:**
```bash
mvn spring-boot:run
```

**Wait until you see:** `Started SalonBookingApplication` in the console

The backend will run on: `http://localhost:8080`

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

## Step 3: Start the Frontend

**Open a NEW terminal window** (keep backend running), then:

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Start a local web server:**
```bash
python3 -m http.server 8000
```

**Alternative:** If you don't have Python, you can:
- Install Node.js and run: `npx http-server -p 8000`
- Or use any other local web server

3. **Open your browser and go to:**
```
http://localhost:8000
```

## You're Ready! 🎉

The application should now be running:
- **Backend API**: `http://localhost:8080`
- **Frontend**: `http://localhost:8000`

### First Steps:
1. **As Admin**: Login with `admin` / `admin123` to access admin features
2. **As User**: Click "Register" to create a new account
3. **Browse Services**: Click "Services" to see available salon services
4. **Book Appointment**: Login and click "Book Now" on any service

## Troubleshooting

### Backend won't start:
- **Check Java**: Make sure Java 11+ is installed and in PATH
  ```bash
  /usr/libexec/java_home -V  # macOS: shows available Java versions
  export JAVA_HOME=$(/usr/libexec/java_home -v 11)  # Set Java 11
  ```
- **Check database**: Make sure PostgreSQL is running
- **Check port**: Make sure port 8080 is not already in use

### Database connection errors:
- Update `backend/src/main/resources/application.properties` with your PostgreSQL credentials
- Make sure the database `salon_booking` exists

### Frontend can't connect to backend:
- Make sure backend is running on port 8080
- Check browser console (F12) for errors
- Make sure you're using `http://localhost:8000` (not `file://`)

## Stopping the Application

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
