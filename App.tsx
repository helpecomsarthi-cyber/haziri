import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

import DashboardScreen from './screens/DashboardScreen';
import EmployeesScreen from './screens/EmployeesScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import PayrollScreen from './screens/PayrollScreen';
import LoginScreen from './screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (focused) {
            if (route.name === 'Dashboard') iconName = 'grid';
            else if (route.name === 'Employees') iconName = 'people';
            else if (route.name === 'Attendance') iconName = 'calendar';
            else if (route.name === 'Payroll') iconName = 'cash';
          } else {
            if (route.name === 'Dashboard') iconName = 'grid-outline';
            else if (route.name === 'Employees') iconName = 'people-outline';
            else if (route.name === 'Attendance') iconName = 'calendar-outline';
            else if (route.name === 'Payroll') iconName = 'cash-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#25D366',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#075E54' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Hajiri Admin' }} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Employees" component={EmployeesScreen} />
      <Tab.Screen name="Payroll" component={PayrollScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [fontsLoaded] = useFonts({ ...Ionicons.font });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#075E54" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session && session.user ? (
            <Stack.Screen name="Main" component={AppTabs} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
