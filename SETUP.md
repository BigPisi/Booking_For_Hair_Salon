# Setup Instructions

## Prerequisites

1. **Java 11 or higher** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
2. **PostgreSQL 12 or higher** - Download from [PostgreSQL](https://www.postgresql.org/download/)
3. **Maven 3.6 or higher** - Download from [Maven](https://maven.apache.org/download.cgi)
4. **Web Browser** - Chrome, Firefox, Safari, or Edge

## Database Setup

1. Start PostgreSQL service

2. Create the database:
```sql
CREATE DATABASE salon_booking;
```

3. Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/salon_booking
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. Run the schema file to create tables and insert sample data:
```bash
psql -U your_username -d salon_booking -f database/schema.sql
```

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend API will be available at `http://localhost:8080`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Option 1: Open directly in browser
   - Simply open `index.html` in your web browser
   - Note: Some features may be limited due to CORS when opening directly

3. Option 2: Use a local web server (Recommended)
   - Using Python 3:
     ```bash
     python3 -m http.server 8000
     ```
   - Using Node.js (if you have http-server installed):
     ```bash
     npx http-server -p 8000
     ```
   - Open `http://localhost:8000` in your browser

## Using the Application

### As a Public User:
1. Register a new account or login with existing credentials
2. Browse services
3. Book appointments
4. View and cancel your bookings

### As an Admin:
1. Login with admin credentials
2. Access the Admin panel to:
   - Add/Edit/Delete services and categories
   - Set service prices
3. Access the Analytics dashboard to:
   - View appointment statistics
   - See revenue reports
   - View popular services

## Troubleshooting

### Database Connection Issues:
- Verify PostgreSQL is running
- Check database credentials in `application.properties`
- Ensure the database `salon_booking` exists

### Backend Won't Start:
- Check Java version: `java -version` (should be 11 or higher)
- Check Maven: `mvn -version`
- Review error messages in the console

### Frontend API Errors:
- Ensure backend is running on `http://localhost:8080`
- Check browser console for CORS errors
- Verify you're using a web server (not file:// protocol)

### CORS Issues:
- Make sure you're accessing the frontend via HTTP (not file://)
- Check that the backend CORS configuration allows your frontend URL
- The default configuration allows `http://localhost:8000` and `http://127.0.0.1:8000`
