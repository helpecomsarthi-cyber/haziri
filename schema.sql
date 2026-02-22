-- Hajiri Admin SaaS Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Employees Table
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    dailyWage NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    org_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Attendance Table
CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employeeId UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    inTime TEXT,
    outTime TEXT,
    status TEXT NOT NULL DEFAULT 'Present', -- Present, Absent, Late, Working
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Payroll Table
CREATE TABLE payroll (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employeeId UUID REFERENCES employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- e.g., 'October 2023'
    presentDays INTEGER DEFAULT 0,
    absentDays INTEGER DEFAULT 0,
    lateDays INTEGER DEFAULT 0,
    totalSalary NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending', -- Paid, Pending
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) - Recommended for Production
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Assuming authenticated users can see everything for now)
CREATE POLICY "Allow public read access" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON employees FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON payroll FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON payroll FOR UPDATE USING (true);
