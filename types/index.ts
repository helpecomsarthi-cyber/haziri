export interface Employee {
    id: string;
    name: string;
    phone: string;
    role: string;
    dailyWage: number;
    status: string;
    org_id?: string;
    created_at?: string;
}

export interface Attendance {
    id: string;
    employeeId: string;
    date: string;
    inTime: string;
    outTime: string;
    status: 'Present' | 'Absent' | 'Late' | 'Working';
    location: string;
    latitude?: number;
    longitude?: number;
    created_at?: string;
}

export interface Payroll {
    id: string;
    employeeId: string;
    month: string;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalSalary: number;
    status: 'Paid' | 'Pending';
    created_at?: string;
}
