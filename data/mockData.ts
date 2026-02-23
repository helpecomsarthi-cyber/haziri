export const mockEmployees = [
  { id: '1', name: 'Raju Bhai', phone: '+91 9876543210', role: 'Worker', daily_wage: 500, status: 'Active' },
  { id: '2', name: 'Suresh Kumar', phone: '+91 9876543211', role: 'Supervisor', daily_wage: 800, status: 'Active' },
  { id: '3', name: 'Amit Singh', phone: '+91 9876543212', role: 'Worker', daily_wage: 500, status: 'Active' },
  { id: '4', name: 'Priya Sharma', phone: '+91 9876543213', role: 'Accountant', daily_wage: 1000, status: 'Active' },
  { id: '5', name: 'Vikram', phone: '+91 9876543214', role: 'Driver', daily_wage: 600, status: 'Active' },
];

export const mockAttendance = [
  { id: '1', employee_id: '1', date: '2023-10-25', in_time: '08:55 AM', out_time: '06:10 PM', status: 'Present', location: 'Factory Gate' },
  { id: '2', employee_id: '2', date: '2023-10-25', in_time: '08:45 AM', out_time: '06:30 PM', status: 'Present', location: 'Office' },
  { id: '3', employee_id: '3', date: '2023-10-25', in_time: '09:15 AM', out_time: '06:00 PM', status: 'Late', location: 'Factory Gate' },
  { id: '4', employee_id: '4', date: '2023-10-25', in_time: '-', out_time: '-', status: 'Absent', location: '-' },
  { id: '5', employee_id: '5', date: '2023-10-25', in_time: '09:00 AM', out_time: '-', status: 'Working', location: 'Warehouse' },
];

export const mockPayroll = [
  { id: '1', employee_id: '1', month: 'October 2023', present_days: 22, absent_days: 2, late_days: 1, total_salary: 11000, status: 'Pending' },
  { id: '2', employee_id: '2', month: 'October 2023', present_days: 25, absent_days: 0, late_days: 0, total_salary: 20000, status: 'Paid' },
  { id: '3', employee_id: '3', month: 'October 2023', present_days: 20, absent_days: 4, late_days: 3, total_salary: 9500, status: 'Pending' },
];
