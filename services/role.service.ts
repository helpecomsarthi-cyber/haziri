import { supabase } from '../lib/supabase';
import { Role } from '../types';

export const roleService = {
    async getRoles() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('roles')
                .select('*')
                .eq('org_id', user.id)
                .order('name');

            if (error) throw error;
            return data as Role[];
        } catch (e) {
            console.error('Failed to fetch roles:', e);
            return [];
        }
    },

    async addRole(name: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('roles')
                .insert([{ name, org_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            console.error('Failed to add role:', e);
            throw e;
        }
    },

    async updateRole(id: string, name: string) {
        try {
            const { error } = await supabase
                .from('roles')
                .update({ name })
                .eq('id', id);

            if (error) throw error;
        } catch (e) {
            console.error('Failed to update role:', e);
            throw e;
        }
    },

    async deleteRole(id: string) {
        try {
            const { error } = await supabase
                .from('roles')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (e) {
            console.error('Failed to delete role:', e);
            throw e;
        }
    }
};
