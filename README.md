# Hair Salon Booking System

A web-based application for booking services in a hair salon. This graduation project implements a full-stack booking system with user management, appointment scheduling, service management, and analytics.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Java (Spring Boot)
- **Database**: PostgreSQL

## Features

1. **User Management**
   - Admin and public user roles
   - User registration and authentication
   - Profile management

2. **Appointment Booking**
   - Book appointments with hairdressers
   - View existing appointments
   - Cancel appointments
   - Search available time slots

3. **Service Management (Admin)**
   - Add/edit services and categories
   - Manage service prices
   - Assign services to hairdressers

4. **Search and Filter**
   - Sort by categories, services, or hairdressers
   - Search services
   - Search available hours

5. **Analytics Dashboard (Admin)**
   - View appointment statistics
   - Revenue tracking
   - Popular services analysis

## Database Schema

The database consists of 7 tables:
1. `users` - User accounts (admin and public)
2. `categories` - Service categories
3. `services` - Services offered
4. `hairdressers` - Hairdresser information
5. `service_prices` - Pricing for services per hairdresser
6. `working_hours` - Hairdresser availability
7. `appointments` - Booking records

## Setup Instructions

### Prerequisites
- Java 11 or higher
- PostgreSQL 12 or higher
- Maven 3.6 or higher

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE salon_booking;
```

2. Update database credentials in `src/main/resources/application.properties`

3. Run the schema file:
```bash
psql -U your_username -d salon_booking -f database/schema.sql
```

### Backend Setup

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

### Frontend Setup

1. Open `frontend/index.html` in a web browser or serve it using a local web server

2. For development, you can use Python's HTTP server:
```bash
cd frontend
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser

## Default Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Public users**: Register through the registration page

## API Endpoints

- `GET /api/services` - Get all services
- `GET /api/services/{id}` - Get service by ID
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/{id}` - Update service (admin only)
- `DELETE /api/services/{id}` - Delete service (admin only)
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}/cancel` - Cancel appointment
- `GET /api/analytics` - Get analytics (admin only)
- `GET /api/hairdressers` - Get all hairdressers
- `GET /api/available-slots` - Get available time slots

## Project Structure

```
.
├── backend/              # Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
├── frontend/             # HTML/CSS/JS frontend
│   ├── css/
│   ├── js/
│   └── index.html
├── database/             # Database schema and scripts
│   └── schema.sql
└── README.md
```
