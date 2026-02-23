import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { employeeService } from '../services/employee.service';
import { roleService } from '../services/role.service';
import { Employee, Role } from '../types';

export default function EmployeesScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // New Employee Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsApp, setNewWhatsApp] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newWage, setNewWage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [empData, roleData] = await Promise.all([
      employeeService.getEmployees(),
      roleService.getRoles()
    ]);
    setEmployees(empData as Employee[]);
    setRoles(roleData);
    if (roleData.length > 0) {
      setNewRole(roleData[0].name);
    }
    setLoading(false);
  };

  const handleEditPress = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewName(employee.name);
    setNewPhone(employee.phone);
    setNewWhatsApp(employee.whatsapp_number || '');
    setNewRole(employee.role);
    setNewWage(employee.daily_wage.toString());
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setNewName('');
    setNewPhone('');
    setNewWhatsApp('');
    setNewRole('Staff');
    setNewWage('');
  };

  const handleSubmit = async () => {
    if (!newName || !newPhone || !newWage) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const employeeData = {
        name: newName,
        phone: newPhone,
        whatsapp_number: newWhatsApp,
        role: newRole,
        daily_wage: parseFloat(newWage),
        status: editingEmployee ? editingEmployee.status : 'Active'
      };

      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, employeeData);
        Alert.alert('Success', 'Staff details updated!');
      } else {
        await employeeService.addEmployee(employeeData);
        Alert.alert('Success', 'Staff added successfully!');
      }

      setModalVisible(false);
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.infoText}>₹{item.daily_wage} / day</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEditPress(item)}
        >
          <Ionicons name="create-outline" size={18} color="#075E54" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            const url = `whatsapp://send?phone=${item.phone}&text=Namaste ${item.name}`;
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'WhatsApp is not installed on your device');
            });
          }}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#25D366" />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <Text style={styles.searchText}>Search staff...</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#E8F5E9', marginRight: 10 }]} onPress={() => navigation.navigate('Locations')}>
          <Ionicons name="location" size={20} color="#075E54" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && employees.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E54" />
        </View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={item => item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadEmployees}
        />
      )}

      {/* Add Staff Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEmployee ? 'Edit Staff' : 'Add New Staff'}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter name"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>WhatsApp Number (for Bot)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="91XXXXXXXXXX"
                  value={newWhatsApp}
                  onChangeText={setNewWhatsApp}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Calling Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit number"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Daily Wage (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  value={newWage}
                  onChangeText={setNewWage}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleOptions}>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <TouchableOpacity
                        key={role.id}
                        style={[styles.roleChip, newRole === role.name && styles.activeRoleChip]}
                        onPress={() => setNewRole(role.name)}
                      >
                        <Text style={[styles.roleChipText, newRole === role.name && styles.activeRoleChipText]}>
                          {role.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyRolesText}>No roles found. Add roles in Dashboard {'>'} Manage Roles.</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>
                  {loading ? 'Processing...' : (editingEmployee ? 'Update Details' : 'Add Employee')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  searchText: {
    color: '#999',
    marginLeft: 10,
  },
  addBtn: {
    backgroundColor: '#075E54',
    padding: 10,
    borderRadius: 8,
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
  userInfo: {
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
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 10,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    color: '#555',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 6,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#075E54',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  roleChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeRoleChip: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  roleChipText: {
    color: '#666',
    fontSize: 14,
  },
  activeRoleChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#075E54',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  emptyRolesText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  }
});
