import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { roleService } from '../services/role.service';
import { Role } from '../types';

export default function RolesScreen() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        const data = await roleService.getRoles();
        setRoles(data);
        setLoading(false);
    };

    const handleAddOrUpdate = async () => {
        if (!newRoleName.trim()) {
            Alert.alert('Error', 'Please enter a role name');
            return;
        }

        try {
            setLoading(true);
            if (editingRole) {
                await roleService.updateRole(editingRole.id, newRoleName);
                Alert.alert('Success', 'Role updated!');
            } else {
                await roleService.addRole(newRoleName);
                Alert.alert('Success', 'Role added!');
            }
            setModalVisible(false);
            setNewRoleName('');
            setEditingRole(null);
            loadRoles();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Role',
            'Are you sure you want to delete this role?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await roleService.deleteRole(id);
                            loadRoles();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Delete failed');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Role }) => (
        <View style={styles.card}>
            <View style={styles.roleInfo}>
                <Ionicons name="briefcase-outline" size={24} color="#075E54" />
                <Text style={styles.roleName}>{item.name}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                        setEditingRole(item);
                        setNewRoleName(item.name);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="pencil" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash" size={20} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Custom Roles</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => {
                        setEditingRole(null);
                        setNewRoleName('');
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.addBtnText}>New Role</Text>
                </TouchableOpacity>
            </View>

            {loading && !modalVisible ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
                </View>
            ) : (
                <FlatList
                    data={roles}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyView}>
                            <Ionicons name="briefcase" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No custom roles yet.</Text>
                            <Text style={styles.emptySubText}>Add roles like 'Security', 'Driver', etc.</Text>
                        </View>
                    }
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingRole ? 'Edit Role' : 'Add New Role'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Role Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Security Guard"
                                value={newRoleName}
                                onChangeText={setNewRoleName}
                                autoFocus
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, loading && styles.disabledBtn]}
                                onPress={handleAddOrUpdate}
                                disabled={loading}
                            >
                                <Text style={styles.submitBtnText}>
                                    {loading ? 'Processing...' : (editingRole ? 'Update Role' : 'Create Role')}
                                </Text>
                            </TouchableOpacity>
                        </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    addBtn: {
        flexDirection: 'row',
        backgroundColor: '#075E54',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center',
    },
    addBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    list: {
        padding: 15,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    roleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 15,
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        padding: 8,
        marginLeft: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyView: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 10,
    },
    emptySubText: {
        color: '#999',
        marginTop: 5,
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
        minHeight: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    form: {
        marginTop: 10,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E1E4E8',
        marginBottom: 20,
    },
    submitBtn: {
        backgroundColor: '#075E54',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.7,
    },
});
