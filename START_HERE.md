# How to Start the Project - Step by Step

## Issue Fix: Invalid XML Tag

The `pom.xml` file had an invalid XML tag that I've now fixed. The issue was `<n>` instead of `<name>`.

## Now Try Again:

### Step 1: Open Terminal

### Step 2: Navigate to Backend (IMPORTANT - Use quotes!)

Your project is in a path with spaces, so you **must use quotes**:

```bash
cd "/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen/backend"
```

**VERIFY you're in the right directory:**
```bash
pwd
```
You should see: `/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen/backend`

**Check that pom.xml exists:**
```bash
ls pom.xml
```
You should see: `pom.xml`

### Step 3: Build the Project

```bash
mvn clean install
```

This will:
- Download dependencies (first time takes a few minutes)
- Compile the code
- Build the project

### Step 4: Run the Backend

```bash
mvn spring-boot:run
```

**Wait for:** You should see `Started SalonBookingApplication` in the output.

The backend is now running on: `http://localhost:8080`

**Keep this terminal open!**

### Step 5: Start Frontend (New Terminal Window)

Open a **NEW terminal window** and run:

```bash
cd "/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen/frontend"
python3 -m http.server 8000
```

### Step 6: Open Browser

Go to: `http://localhost:8000`

## Troubleshooting

### If `mvn clean install` fails:
- Make sure you're in the backend directory (use `pwd` to check)
- Check that `pom.xml` exists (use `ls pom.xml` to check)
- Make sure Java 11+ is installed: `java -version`

### If you see "No POM found":
- You're in the wrong directory
- Double-check the path with quotes: `cd "/Users/hristiangerov/Library/Mobile Documents/com~apple~CloudDocs/School/diplomen/backend"`
- Verify: `ls -la pom.xml`

### If database connection fails:
- Check your PostgreSQL password in: `backend/src/main/resources/application.properties`
- Make sure PostgreSQL is running
- Verify database `salon_booking` exists in pgAdmin
