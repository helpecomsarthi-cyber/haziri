import { supabase } from '../lib/supabase';
import { BusinessLocation } from '../types';

export const locationService = {
    async getLocations() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('org_id', user.id)
                .order('name');

            if (error) throw error;
            return data;
        } catch (e) {
            console.error('Failed to fetch locations:', e);
            return [];
        }
    },

    async addLocation(location: Omit<BusinessLocation, 'id' | 'created_at'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('locations')
            .insert([{ ...location, org_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteLocation(id: string) {
        const { error } = await supabase
            .from('locations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
