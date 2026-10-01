import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { STUDENT, VARIANT, examStamp } from '../constants/student';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export const LoginScreen = () => {
    const [inputVal, setInputVal] = useState('');
    const login = useAuthStore((state) => state.login);

    const handleLogin = () => {
        const stamp = examStamp();
        const token = `ktxgo-${STUDENT.mssv}-${stamp}`;
        login(token);
    };

    const stampText = `TH2 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${examStamp()}`;
    const isPhone = VARIANT.authField === 'phone';

    return (
        <SafeAreaView style={styles.container}>
            {/* Watermark ở Top nếu watermarkAtTop = true */}
            {VARIANT.watermarkAtTop && (
                <View style={styles.watermarkContainer}>
                    <Text style={styles.watermarkText}>{stampText}</Text>
                </View>
            )}

            <View style={styles.content}>
                <Text style={styles.title}>KTXGO</Text>
                <Text style={styles.subtitle}>Giao đồ tận phòng ký túc xá</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={
                            isPhone
                                ? `Số điện thoại — 09${STUDENT.mssv.slice(-8)}`
                                : `Email — ${STUDENT.mssv}@iuh.edu.vn`
                        }
                        placeholderTextColor={COLORS.textLight}
                        value={inputVal}
                        onChangeText={setInputVal}
                        keyboardType={isPhone ? 'phone-pad' : 'email-address'}
                        autoCapitalize="none"
                    />
                    <Text style={styles.variantBadge}>
                        ({isPhone ? 'Phone' : 'Email'})
                    </Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Vào cửa hàng</Text>
                </TouchableOpacity>

                <Text style={styles.note}>Auth Stack · chưa có token</Text>
            </View>

            {/* Watermark ở Bottom nếu watermarkAtTop = false */}
            {!VARIANT.watermarkAtTop && (
                <View style={styles.watermarkContainer}>
                    <Text style={styles.watermarkText}>{stampText}</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'space-between',
    },
    watermarkContainer: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
    },
    watermarkText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        position: 'relative',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingRight: 60,
        color: COLORS.text,
        fontSize: 14,
    },
    variantBadge: {
        position: 'absolute',
        right: 16,
        top: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    button: {
        width: '100%',
        height: 52,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: 'bold',
    },
    note: {
        color: COLORS.textLight,
        fontSize: 13,
    },
});