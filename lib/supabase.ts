import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uritsskfviccsxakznvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyaXRzc2tmdmljY3N4YWt6bnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzMwNTQsImV4cCI6MjA4NzM0OTA1NH0.0G6U75JEBkWW9iVVyN3LpYRGOqcNvOAa1fGduPbDGLw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
