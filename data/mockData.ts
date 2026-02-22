export const mockEmployees = [
  { id: '1', name: 'Raju Bhai', phone: '+91 9876543210', role: 'Worker', dailyWage: 500, status: 'Active' },
  { id: '2', name: 'Suresh Kumar', phone: '+91 9876543211', role: 'Supervisor', dailyWage: 800, status: 'Active' },
  { id: '3', name: 'Amit Singh', phone: '+91 9876543212', role: 'Worker', dailyWage: 500, status: 'Active' },
  { id: '4', name: 'Priya Sharma', phone: '+91 9876543213', role: 'Accountant', dailyWage: 1000, status: 'Active' },
  { id: '5', name: 'Vikram', phone: '+91 9876543214', role: 'Driver', dailyWage: 600, status: 'Active' },
];

export const mockAttendance = [
  { id: '1', employeeId: '1', date: '2023-10-25', inTime: '08:55 AM', outTime: '06:10 PM', status: 'Present', location: 'Factory Gate' },
  { id: '2', employeeId: '2', date: '2023-10-25', inTime: '08:45 AM', outTime: '06:30 PM', status: 'Present', location: 'Office' },
  { id: '3', employeeId: '3', date: '2023-10-25', inTime: '09:15 AM', outTime: '06:00 PM', status: 'Late', location: 'Factory Gate' },
  { id: '4', employeeId: '4', date: '2023-10-25', inTime: '-', outTime: '-', status: 'Absent', location: '-' },
  { id: '5', employeeId: '5', date: '2023-10-25', inTime: '09:00 AM', outTime: '-', status: 'Working', location: 'Warehouse' },
];

export const mockPayroll = [
  { id: '1', employeeId: '1', month: 'October 2023', presentDays: 22, absentDays: 2, lateDays: 1, totalSalary: 11000, status: 'Pending' },
  { id: '2', employeeId: '2', month: 'October 2023', presentDays: 25, absentDays: 0, lateDays: 0, totalSalary: 20000, status: 'Paid' },
  { id: '3', employeeId: '3', month: 'October 2023', presentDays: 20, absentDays: 4, lateDays: 3, totalSalary: 9500, status: 'Pending' },
];
