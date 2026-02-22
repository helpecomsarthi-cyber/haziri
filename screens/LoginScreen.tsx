import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [status, setStatus] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);

    async function handleAuth() {
        setStatus(null);
        if (isRegistering) {
            await signUpWithEmail();
        } else {
            await signInWithEmail();
        }
    }

    async function signInWithEmail() {
        if (!email || !password) {
            setStatus({ msg: 'Please enter email and password', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) throw error;
        } catch (error: any) {
            setStatus({ msg: error.message || 'Login Failed', type: 'error' });
            if (Platform.OS !== 'web') Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function signUpWithEmail() {
        if (!email || !password) {
            setStatus({ msg: 'Please enter email and password', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) throw error;

            setStatus({ msg: 'Registration Successful! Please login.', type: 'success' });
            setIsRegistering(false);
        } catch (error: any) {
            setStatus({ msg: error.message || 'Registration Failed', type: 'error' });
            if (Platform.OS !== 'web') Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="calendar" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>Hajiri Admin</Text>
                    <Text style={styles.subtitle}>
                        {isRegistering ? 'Register Your Business' : 'SME Staff Management System'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {status && (
                        <View style={[styles.statusBox, status.type === 'error' ? styles.errorBox : styles.successBox]}>
                            <Text style={styles.statusTextContent}>{status.msg}</Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginBtn, loading && styles.disabledBtn]}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        <Text style={styles.loginBtnText}>
                            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Login')}
                        </Text>
                    </TouchableOpacity>

                    {!isRegistering && (
                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                    </Text>
                    <TouchableOpacity onPress={() => { setStatus(null); setIsRegistering(!isRegistering); }}>
                        <Text style={styles.registerText}>
                            {isRegistering ? ' Back to Login' : ' Register your Business'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#075E54',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#25D366',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#A5D6A7',
        marginTop: 5,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 12,
        backgroundColor: '#f9f9f9',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#333',
    },
    loginBtn: {
        backgroundColor: '#075E54',
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotBtn: {
        alignItems: 'center',
        marginTop: 15,
    },
    forgotText: {
        color: '#666',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#E8F5E9',
    },
    registerText: {
        color: '#25D366',
        fontWeight: 'bold',
    },
    statusBox: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorBox: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#EF9A9A',
    },
    successBox: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#A5D6A7',
    },
    statusTextContent: {
        fontSize: 14,
        textAlign: 'center',
        color: '#333',
    }
});
