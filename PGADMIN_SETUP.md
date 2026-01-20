# Database Setup with pgAdmin 4

This guide will help you set up the database using pgAdmin 4 (GUI tool) instead of the command line.

## Step 1: Open pgAdmin 4

1. Launch pgAdmin 4 from your applications
2. If prompted, enter your master password (this is set when you first install pgAdmin)
3. In the left sidebar, expand **Servers** → **PostgreSQL** (or your server name)

## Step 2: Create the Database

1. **Right-click** on **Databases** in the left sidebar
2. Select **Create** → **Database...**
3. In the **Create - Database** dialog:
   - **Database name**: `salon_booking`
   - **Owner**: Leave as default (usually `postgres`) or select your PostgreSQL user
   - Click **Save**

You should now see `salon_booking` in your Databases list.

## Step 3: Run the Schema SQL File

1. **Click on** the `salon_booking` database in the left sidebar to select it
2. Click on the **Tools** menu at the top → **Query Tool**
   - Alternatively, right-click on `salon_booking` → **Query Tool**
   - Or use the shortcut: Click the **SQL icon** (</>) in the toolbar

3. In the Query Tool window:
   - Click the **Open File** button (folder icon) in the toolbar
   - Navigate to your project folder: `diplomen/database/schema.sql`
   - Select the file and click **Open**

4. The SQL script will appear in the query editor

5. **Run the script:**
   - Click the **Execute/Refresh** button (▶️) in the toolbar
   - Or press `F5` on your keyboard
   - Or use the menu: **Execute** → **Execute (F5)**

6. Wait for the execution to complete. You should see:
   - **Success** message in the **Messages** tab at the bottom
   - If there are any errors, they will appear in red in the Messages tab

## Step 4: Verify the Setup

To verify everything was created correctly:

1. In the left sidebar, expand:
   - **Databases** → **salon_booking** → **Schemas** → **public** → **Tables**

2. You should see 7 tables:
   - `users`
   - `categories`
   - `services`
   - `hairdressers`
   - `service_prices`
   - `working_hours`
   - `appointments`

3. To verify sample data was inserted:
   - Right-click on any table (e.g., `users`) → **View/Edit Data** → **All Rows**
   - You should see data entries (e.g., the admin user)

## Step 5: Update Backend Configuration (if needed)

Check your PostgreSQL connection details:

1. In pgAdmin 4, right-click on your **Server** (PostgreSQL) → **Properties**
2. Note the **Host** and **Port** (usually `localhost` and `5432`)
3. Check your username (usually `postgres`)

4. Update `backend/src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/salon_booking
   spring.datasource.username=postgres
   spring.datasource.password=your_postgres_password
   ```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password.

## Troubleshooting

### Can't connect to server in pgAdmin 4:
- Make sure PostgreSQL is running
- Check if you're using the correct server name and port
- Verify your master password for pgAdmin

### Permission denied errors:
- Make sure you're connected with a user that has CREATE DATABASE privileges
- Usually the `postgres` user has these privileges by default

### Tables not appearing:
- Make sure you expanded: **Databases** → **salon_booking** → **Schemas** → **public** → **Tables**
- Refresh the browser in pgAdmin (right-click on Tables → Refresh)
- Check the Messages tab for any error messages

### SQL script errors:
- Make sure you selected the `salon_booking` database before running the script
- Check that you opened the correct `schema.sql` file
- Look at the error messages in the Messages tab for specific issues

## Next Steps

Once the database is set up:
1. Update the database password in `backend/src/main/resources/application.properties` if needed
2. Start the backend (see QUICK_START.md)
3. Start the frontend
4. You're ready to use the application!
