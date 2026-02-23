import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { attendanceService } from '../services/attendance.service';
import { employeeService } from '../services/employee.service';
import { supabase } from '../lib/supabase';
import { Employee, Attendance } from '../types';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [empData, attData] = await Promise.all([
        employeeService.getEmployees(),
        attendanceService.getAttendanceByDate('2023-10-25') // Hardcoded for demo parity
      ]);
      setEmployees(empData as Employee[]);
      setAttendance(attData as Attendance[]);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    }
    setLoading(false);
  };

  const presentCount = attendance.filter(a => a.status === 'Present' || a.status === 'Working' || a.status === 'Late').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075E54" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Namaste, Admin</Text>
            <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          </View>
          <TouchableOpacity onPress={() => supabase.auth.signOut()}>
            <Ionicons name="log-out-outline" size={24} color="#C62828" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="people" size={24} color="#2E7D32" />
          <Text style={styles.statNumber}>{employees.length}</Text>
          <Text style={styles.statLabel}>Total Staff</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#1565C0" />
          <Text style={styles.statNumber}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Ionicons name="close-circle" size={24} color="#C62828" />
          <Text style={styles.statNumber}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="time" size={24} color="#EF6C00" />
          <Text style={styles.statNumber}>{lateCount}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent WhatsApp Punches</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Attendance')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {attendance.slice(0, 3).map((record, index) => {
          const emp = employees.find(e => e.id === record.employee_id);
          return (
            <View key={index} style={styles.punchCard}>
              <View style={styles.punchInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{emp?.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.empName}>{emp?.name}</Text>
                  <Text style={styles.punchTime}>
                    <Ionicons name="logo-whatsapp" size={12} color="#25D366" /> IN: {record.in_time} | Loc: {record.location}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge,
              record.status === 'Present' || record.status === 'Working' ? styles.statusPresent :
                record.status === 'Late' ? styles.statusLate : styles.statusAbsent
              ]}>
                <Text style={styles.statusText}>{record.status}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Coming Soon', 'WhatsApp Broadcast feature will be available in the next update!')}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.actionText}>Send Broadcast</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Feature Active', 'Detailed reports will be sent to your registered email.')}
          >
            <Ionicons name="document-text" size={24} color="#075E54" />
            <Text style={styles.actionText}>Daily Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Employees', { autoOpenModal: true })}
          >
            <Ionicons name="add-circle" size={24} color="#075E54" />
            <Text style={styles.actionText}>Add Staff</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#075E54',
    fontWeight: '600',
  },
  punchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  punchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  empName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  punchTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPresent: {
    backgroundColor: '#E8F5E9',
  },
  statusLate: {
    backgroundColor: '#FFF3E0',
  },
  statusAbsent: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    width: '30%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    color: '#333',
  }
});
