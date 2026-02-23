export interface Employee {
    id: string;
    name: string;
    phone: string;
    whatsapp_number?: string;
    role: string;
    daily_wage: number;
    status: string;
    org_id?: string;
    created_at?: string;
}

export interface Attendance {
    id: string;
    employee_id: string;
    date: string;
    in_time: string;
    out_time: string;
    status: 'Present' | 'Absent' | 'Late' | 'Working';
    location: string;
    latitude?: number;
    longitude?: number;
    distance_meters?: number;
    verified_location_id?: string;
    created_at?: string;
}

export interface Payroll {
    id: string;
    employee_id: string;
    month: string;
    present_days: number;
    absent_days: number;
    late_days: number;
    total_salary: number;
    status: 'Paid' | 'Pending';
    created_at?: string;
}

export interface BusinessLocation {
    id: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    org_id?: string;
    created_at?: string;
}
