import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { attendanceService } from '../services/attendance.service';
import { mockEmployees } from '../data/mockData';
import { Attendance } from '../types';

export default function AttendanceScreen() {
  const [filter, setFilter] = useState('All');
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    // Hardcoded date for demo consistency, in production would be new Date().toISOString().split('T')[0]
    const data = await attendanceService.getAttendanceByDate('2023-10-25');
    setAttendance(data as Attendance[]);
    setLoading(false);
  };

  const filteredData = attendance.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Present') return item.status === 'Present' || item.status === 'Working';
    if (filter === 'Absent') return item.status === 'Absent';
    if (filter === 'Late') return item.status === 'Late';
    return true;
  });

  const renderItem = ({ item }: { item: Attendance }) => {
    const emp = mockEmployees.find(e => e.id === item.employeeId);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.empName}>{emp?.name}</Text>
          <View style={[styles.statusBadge,
          item.status === 'Present' || item.status === 'Working' ? styles.statusPresent :
            item.status === 'Late' ? styles.statusLate : styles.statusAbsent
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>PUNCH IN</Text>
            <Text style={styles.timeValue}>{item.inTime}</Text>
            {item.inTime !== '-' && (
              <Text style={styles.locationText}>
                <Ionicons name="location" size={10} /> {item.location}
              </Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>PUNCH OUT</Text>
            <Text style={styles.timeValue}>{item.outTime}</Text>
            {item.outTime !== '-' && (
              <Text style={styles.locationText}>
                <Ionicons name="location" size={10} /> {item.location}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateSelector}>
        <Ionicons name="chevron-back" size={24} color="#075E54" />
        <Text style={styles.dateText}>Today, {new Date().toLocaleDateString()}</Text>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </View>

      <View style={styles.filterContainer}>
        {['All', 'Present', 'Absent', 'Late'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E54" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  filterBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterBtnActive: {
    backgroundColor: '#075E54',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  empName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  timeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  timeLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  }
});
