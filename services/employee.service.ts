import { supabase } from '../lib/supabase';
import { mockEmployees } from '../data/mockData';

export interface Employee {
    id: string;
    name: string;
    phone: string;
    role: string;
    daily_wage: number;
    status: string;
    org_id?: string;
}

export const employeeService = {
    async getEmployees() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return mockEmployees;

            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('org_id', user.id)
                .order('name');

            if (error) throw error;
            return data && data.length > 0 ? data : mockEmployees;
        } catch (e) {
            console.warn('Supabase fetch failed, using mock data:', e);
            return mockEmployees;
        }
    },

    async addEmployee(employee: Omit<Employee, 'id'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('employees')
            .insert([{ ...employee, org_id: user.id }])
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
