import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { locationService } from '../services/location.service';
import { BusinessLocation } from '../types';

export default function LocationsScreen() {
    const [locations, setLocations] = useState<BusinessLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newLat, setNewLat] = useState<number | null>(null);
    const [newLng, setNewLng] = useState<number | null>(null);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        setLoading(true);
        const data = await locationService.getLocations();
        setLocations(data);
        setLoading(false);
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission is required to get coordinates');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            setNewLat(location.coords.latitude);
            setNewLng(location.coords.longitude);
            Alert.alert('Success', 'Current GPS coordinates captured!');
        } catch (e) {
            Alert.alert('Error', 'Could not get current location');
        }
    };

    const handleAddLocation = async () => {
        if (!newName) {
            Alert.alert('Error', 'Please enter a location name');
            return;
        }

        try {
            setLoading(true);
            await locationService.addLocation({
                name: newName,
                address: newAddress,
                latitude: newLat || undefined,
                longitude: newLng || undefined,
            });
            setModalVisible(false);
            setNewName('');
            setNewAddress('');
            setNewLat(null);
            setNewLng(null);
            loadLocations();
            Alert.alert('Success', 'Location added successfully!');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not add location');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLocation = (id: string) => {
        Alert.alert(
            'Delete Location',
            'Are you sure you want to delete this site?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await locationService.deleteLocation(id);
                        loadLocations();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: BusinessLocation }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.locInfo}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="location" size={24} color="#075E54" />
                    </View>
                    <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.address}>{item.address || 'No address provided'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteLocation(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#C62828" />
                </TouchableOpacity>
            </View>
            {(item.latitude && item.longitude) && (
                <View style={styles.coordsRow}>
                    <Text style={styles.coords}>GPS: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>Geo-fenced</Text>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Sites</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading && locations.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
                </View>
            ) : (
                <FlatList
                    data={locations}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No locations added yet.</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Site</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Site Name (e.g. Main Gate)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter site name"
                                    value={newName}
                                    onChangeText={setNewName}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Address (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter physical address"
                                    value={newAddress}
                                    onChangeText={setNewAddress}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>GPS Area</Text>
                                <TouchableOpacity style={styles.gpsBtn} onPress={getCurrentLocation}>
                                    <Ionicons name="locate" size={20} color="#075E54" />
                                    <Text style={styles.gpsBtnText}>
                                        {newLat ? `Captured: ${newLat.toFixed(4)}, ${newLng?.toFixed(4)}` : 'Get Current GPS Location'}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={styles.hint}>Stand at the entry point and click to lock the site area.</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, (loading || !newName) && styles.disabledBtn]}
                                onPress={handleAddLocation}
                                disabled={loading || !newName}
                            >
                                <Text style={styles.submitBtnText}>{loading ? 'Saving...' : 'Save Site'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#075E54' },
    addBtn: { backgroundColor: '#075E54', padding: 8, borderRadius: 8 },
    list: { padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    locInfo: { flexDirection: 'row', flex: 1 },
    iconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    address: { fontSize: 13, color: '#666', marginTop: 2 },
    coordsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', alignItems: 'center' },
    coords: { fontSize: 11, color: '#888', fontStyle: 'italic' },
    activeBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    activeText: { fontSize: 10, color: '#1565C0', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#075E54' },
    formGroup: { marginBottom: 15 },
    label: { fontSize: 14, color: '#666', marginBottom: 5 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
    gpsBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#075E54', borderRadius: 8, borderStyle: 'dashed' },
    gpsBtnText: { marginLeft: 10, color: '#075E54', fontWeight: '500' },
    hint: { fontSize: 11, color: '#999', marginTop: 5 },
    submitBtn: { backgroundColor: '#075E54', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledBtn: { backgroundColor: '#ccc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: '#999', fontSize: 16 }
});
