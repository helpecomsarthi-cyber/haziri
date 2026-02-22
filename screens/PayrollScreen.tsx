import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { payrollService } from '../services/payroll.service';
import { mockEmployees } from '../data/mockData';
import { Payroll, Employee } from '../types';

export default function PayrollScreen() {
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    setLoading(true);
    const data = await payrollService.getPayrollByMonth('October 2023');
    setPayroll(data);
    setLoading(false);
  };

  const totalPayroll = payroll.reduce((sum, item) => sum + item.totalSalary, 0);

  const renderItem = ({ item }: { item: Payroll }) => {
    const emp = mockEmployees.find(e => e.id === item.employeeId);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.empName}>{emp?.name}</Text>
          <Text style={styles.salaryAmount}>₹{item.totalSalary.toLocaleString()}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Present</Text>
            <Text style={[styles.statValue, { color: '#2E7D32' }]}>{item.presentDays}d</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Absent</Text>
            <Text style={[styles.statValue, { color: '#C62828' }]}>{item.absentDays}d</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Late</Text>
            <Text style={[styles.statValue, { color: '#EF6C00' }]}>{item.lateDays}d</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, item.status === 'Paid' ? styles.statusPaid : styles.statusPending]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="document-text-outline" size={20} color="#075E54" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>October 2023 Payroll</Text>
        <Text style={styles.summaryAmount}>₹{totalPayroll.toLocaleString()}</Text>
        <Text style={styles.summarySubtitle}>Total Estimated Payout</Text>

        <TouchableOpacity style={styles.generateBtn}>
          <Text style={styles.generateBtnText}>Generate Salary Slips</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Employee Salaries</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={payroll}
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
  loadingContainer: {
    padding: 20,
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  summaryCard: {
    backgroundColor: '#075E54',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  summaryTitle: {
    color: '#A5D6A7',
    fontSize: 16,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  summarySubtitle: {
    color: '#E8F5E9',
    fontSize: 14,
    marginBottom: 20,
  },
  generateBtn: {
    backgroundColor: '#25D366',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listHeader: {
    padding: 15,
    paddingBottom: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 15,
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
  salaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075E54',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  }
});
