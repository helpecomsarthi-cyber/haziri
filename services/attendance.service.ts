import { supabase } from '../lib/supabase';
import { mockAttendance } from '../data/mockData';
import * as Location from 'expo-location';

export interface Attendance {
    id: string;
    employeeId: string;
    date: string;
    inTime: string;
    outTime: string;
    status: string;
    location: string;
    latitude?: number;
    longitude?: number;
}

export const attendanceService = {
    async getAttendanceByDate(date: string) {
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('date', date);

            if (error) throw error;
            return data || mockAttendance;
        } catch (e) {
            return mockAttendance;
        }
    },

    async punchIn(employeeId: string, locationName: string) {
        // Phase 2: Get real GPS location
        let gpsData = {};
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                gpsData = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
            }
        } catch (e) {
            console.warn('Location permission denied or failed');
        }

        const newRecord = {
            employeeId,
            date: new Date().toISOString().split('T')[0],
            inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Present',
            location: locationName,
            ...gpsData
        };

        const { data, error } = await supabase
            .from('attendance')
            .insert([newRecord])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
