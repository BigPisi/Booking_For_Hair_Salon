-- Hair Salon Booking System Database Schema
-- PostgreSQL Database

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS service_prices CASCADE;
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS hairdresser_time_off CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS hairdressers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Categories table (service categories)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Services table (services offered)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Hairdressers table
CREATE TABLE hairdressers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    specialization TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users table (admin, staff, and public users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (role IN ('admin', 'public', 'staff')),
    hairdresser_id INTEGER REFERENCES hairdressers(id) ON DELETE SET NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Service Prices table (allows different prices per hairdresser)
CREATE TABLE service_prices (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    hairdresser_id INTEGER REFERENCES hairdressers(id) ON DELETE SET NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, hairdresser_id)
);

-- 6. Working Hours table (hairdresser availability)
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    hairdresser_id INTEGER NOT NULL REFERENCES hairdressers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE(hairdresser_id, day_of_week)
);

-- 7. Hairdresser time off table
CREATE TABLE hairdresser_time_off (
    id SERIAL PRIMARY KEY,
    hairdresser_id INTEGER NOT NULL REFERENCES hairdressers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Appointments table (booking records)
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    hairdresser_id INTEGER NOT NULL REFERENCES hairdressers(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_future_appointment CHECK (appointment_date >= CURRENT_DATE)
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_hairdresser_date ON appointments(hairdresser_id, appointment_date);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_service_prices_service ON service_prices(service_id);
CREATE INDEX idx_working_hours_hairdresser ON working_hours(hairdresser_id);
CREATE INDEX idx_time_off_hairdresser ON hairdresser_time_off(hairdresser_id);
CREATE INDEX idx_time_off_date ON hairdresser_time_off(date);

-- Insert sample data

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Haircuts', 'Various haircut styles for men and women'),
('Hair Coloring', 'Hair coloring and highlighting services'),
('Hair Styling', 'Hair styling and blowouts'),
('Hair Treatments', 'Hair care and treatment services'),
('Extensions', 'Hair extension services'),
('Beard & Mustache', 'Beard trimming and styling services');

-- Insert hairdressers
INSERT INTO hairdressers (name, email, phone, specialization, is_active) VALUES
('Maria Johnson', 'maria@salon.com', '555-0101', 'Haircuts, Hair Coloring', TRUE),
('John Smith', 'john@salon.com', '555-0102', 'Haircuts, Beard & Mustache', TRUE),
('Sarah Williams', 'sarah@salon.com', '555-0103', 'Hair Styling, Hair Treatments', TRUE),
('Emma Brown', 'emma@salon.com', '555-0104', 'Hair Coloring, Extensions', TRUE);

-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT INTO users (username, email, password, role, first_name, last_name) VALUES
('admin', 'admin@salon.com', 'admin123', 'admin', 'Admin', 'User');

-- Insert staff users linked to hairdressers (password: staff123 - should be hashed in production)
INSERT INTO users (username, email, password, role, hairdresser_id, first_name, last_name) VALUES
('maria', 'maria@salon.com', 'staff123', 'staff', 1, 'Maria', 'Johnson'),
('john', 'john@salon.com', 'staff123', 'staff', 2, 'John', 'Smith'),
('sarah', 'sarah@salon.com', 'staff123', 'staff', 3, 'Sarah', 'Williams'),
('emma', 'emma@salon.com', 'staff123', 'staff', 4, 'Emma', 'Brown');

-- Insert services
INSERT INTO services (category_id, name, description, duration_minutes) VALUES
(1, 'Men''s Haircut', 'Classic men''s haircut and styling', 30),
(1, 'Women''s Haircut', 'Women''s haircut and styling', 45),
(2, 'Full Color', 'Full hair coloring service', 120),
(2, 'Highlights', 'Partial highlights', 90),
(3, 'Blowout', 'Professional hair blowout', 45),
(3, 'Updo Styling', 'Elegant updo styling', 60),
(4, 'Deep Conditioning', 'Deep conditioning treatment', 30),
(5, 'Hair Extensions', 'Professional hair extension installation', 180),
(6, 'Beard Trim', 'Beard trimming and styling', 20);

-- Insert service prices (some services have different prices per hairdresser)
INSERT INTO service_prices (service_id, hairdresser_id, price) VALUES
-- Maria's prices
(1, 1, 25.00), (2, 1, 35.00), (3, 1, 80.00), (4, 1, 65.00),
-- John's prices
(1, 2, 30.00), (6, 2, 25.00), (9, 2, 20.00),
-- Sarah's prices
(2, 3, 40.00), (5, 3, 35.00), (6, 3, 55.00), (7, 3, 45.00),
-- Emma's prices
(2, 4, 38.00), (3, 4, 85.00), (4, 4, 70.00), (8, 4, 200.00);

-- Insert working hours (Monday-Friday, 9 AM - 6 PM for all hairdressers)
INSERT INTO working_hours (hairdresser_id, day_of_week, start_time, end_time, is_available) VALUES
-- Maria (Monday-Friday)
(1, 1, '09:00', '18:00', TRUE),
(1, 2, '09:00', '18:00', TRUE),
(1, 3, '09:00', '18:00', TRUE),
(1, 4, '09:00', '18:00', TRUE),
(1, 5, '09:00', '18:00', TRUE),
-- John (Monday-Friday)
(2, 1, '09:00', '18:00', TRUE),
(2, 2, '09:00', '18:00', TRUE),
(2, 3, '09:00', '18:00', TRUE),
(2, 4, '09:00', '18:00', TRUE),
(2, 5, '09:00', '18:00', TRUE),
-- Sarah (Monday-Saturday)
(3, 1, '09:00', '18:00', TRUE),
(3, 2, '09:00', '18:00', TRUE),
(3, 3, '09:00', '18:00', TRUE),
(3, 4, '09:00', '18:00', TRUE),
(3, 5, '09:00', '18:00', TRUE),
(3, 6, '10:00', '16:00', TRUE),
-- Emma (Tuesday-Saturday)
(4, 2, '09:00', '18:00', TRUE),
(4, 3, '09:00', '18:00', TRUE),
(4, 4, '09:00', '18:00', TRUE),
(4, 5, '09:00', '18:00', TRUE),
(4, 6, '10:00', '16:00', TRUE);
