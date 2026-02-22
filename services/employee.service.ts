import { supabase } from '../lib/supabase';
import { mockEmployees } from '../data/mockData';

export interface Employee {
    id: string;
    name: string;
    phone: string;
    role: string;
    dailyWage: number;
    status: string;
    org_id?: string;
}

export const employeeService = {
    async getEmployees() {
        // Falls back to mock data if supabase is not configured or fails
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('name');

            if (error) throw error;
            return data || mockEmployees;
        } catch (e) {
            console.warn('Supabase fetch failed, using mock data:', e);
            return mockEmployees;
        }
    },

    async addEmployee(employee: Omit<Employee, 'id'>) {
        const { data, error } = await supabase
            .from('employees')
            .insert([employee])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateEmployee(id: string, updates: Partial<Employee>) {
        const { data, error } = await supabase
            .from('employees')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
