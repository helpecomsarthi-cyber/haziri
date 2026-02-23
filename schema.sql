-- Hajiri Admin SaaS Database Schema
-- Run this in your Supabase SQL Editor

-- 0. Clean Wipe (Optional: Remove if you want to keep existing data)
DROP TABLE IF EXISTS payroll CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- 1. Employees Table
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    role TEXT NOT NULL,
    daily_wage NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    org_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Attendance Table
CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    in_time TEXT,
    out_time TEXT,
    status TEXT NOT NULL DEFAULT 'Present', -- Present, Absent, Late, Working
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_meters NUMERIC,
    verified_location_id UUID REFERENCES locations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Payroll Table
CREATE TABLE payroll (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- e.g., 'October 2023'
    present_days INTEGER DEFAULT 0,
    absent_days INTEGER DEFAULT 0,
    late_days INTEGER DEFAULT 0,
    total_salary NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending', -- Paid, Pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Locations Table
CREATE TABLE locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    org_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- 4. Employees Policies
CREATE POLICY "Users can view their own org employees" 
ON employees FOR SELECT 
USING (auth.uid() = org_id);

CREATE POLICY "Users can insert employees for their own org" 
ON employees FOR INSERT 
WITH CHECK (auth.uid() = org_id);

CREATE POLICY "Users can update their own org employees" 
ON employees FOR UPDATE 
USING (auth.uid() = org_id);

-- 5. Attendance Policies
CREATE POLICY "Users can view their own org attendance" 
ON attendance FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = attendance.employee_id 
    AND employees.org_id = auth.uid()
));

CREATE POLICY "Users can insert attendance for their own org" 
ON attendance FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = attendance.employee_id 
    AND employees.org_id = auth.uid()
));

-- 6. Payroll Policies
CREATE POLICY "Users can view their own org payroll" 
ON payroll FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = payroll.employee_id 
    AND employees.org_id = auth.uid()
));

-- 7. Location Policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own org locations"
ON locations FOR SELECT
USING (org_id = auth.uid());

CREATE POLICY "Users can insert their own org locations"
ON locations FOR INSERT
WITH CHECK (org_id = auth.uid());

CREATE POLICY "Users can update their own org locations"
ON locations FOR UPDATE
USING (org_id = auth.uid());

CREATE POLICY "Users can delete their own org locations"
ON locations FOR DELETE
USING (org_id = auth.uid());

-- 8. Roles Table
CREATE TABLE roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    org_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, org_id)
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own org roles"
ON roles FOR SELECT
USING (org_id = auth.uid());

CREATE POLICY "Users can insert their own org roles"
ON roles FOR INSERT
WITH CHECK (org_id = auth.uid());

CREATE POLICY "Users can update their own org roles"
ON roles FOR UPDATE
USING (org_id = auth.uid());

CREATE POLICY "Users can delete their own org roles"
ON roles FOR DELETE
USING (org_id = auth.uid());
