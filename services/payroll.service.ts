import { supabase } from '../lib/supabase';
import { mockPayroll } from '../data/mockData';
import { Payroll } from '../types';

export const payrollService = {
    async getPayrollByMonth(month: string): Promise<Payroll[]> {
        try {
            const { data, error } = await supabase
                .from('payroll')
                .select('*')
                .eq('month', month);

            if (error) throw error;
            return (data || mockPayroll) as Payroll[];
        } catch (e) {
            return mockPayroll as Payroll[];
        }
    },

    async markAsPaid(id: string) {
        const { data, error } = await supabase
            .from('payroll')
            .update({ status: 'Paid' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
