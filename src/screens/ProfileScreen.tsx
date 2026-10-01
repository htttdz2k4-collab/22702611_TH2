import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { STUDENT, VARIANT, examStamp, BASE_SHIP_FEE, ROOM_LABEL } from '../constants/student';
import { COLORS } from '../constants/theme';

// KTX IUH Coordinates
const KTX_COORDS = {
  latitude: 10.822159,
  longitude: 106.686845,
};

// Haversine formula calculation in KM
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in KM

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const ProfileScreen = () => {
  const logout = useAuthStore((state) => state.logout);
  const { distanceKm, shippingFee, setShippingInfo } = useCartStore();

  const [locating, setLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí KTXGO',
            message: 'KTXGO cần quyền vị trí để tính khoảng cách và phí ship chính xác.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Đồng ý',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleGetLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Từ chối', 'Vui lòng cấp quyền vị trí để tính toán phí giao hàng.');
      return;
    }

    setLocating(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });

        const dist = calculateHaversineDistance(
          latitude,
          longitude,
          KTX_COORDS.latitude,
          KTX_COORDS.longitude,
        );

        const formulaRate = VARIANT.shipFormula === 'A' ? 3000 : 5000;
        const fee = BASE_SHIP_FEE + Math.round(dist * formulaRate);
        const formulaName = `Công thức ${VARIANT.shipFormula} (Base ${BASE_SHIP_FEE.toLocaleString('vi-VN')}đ + ${dist.toFixed(1)}km x ${formulaRate.toLocaleString('vi-VN')}đ)`;

        setShippingInfo(dist, fee, formulaName);

        Alert.alert(
          'Đã cập nhật vị trí 📍',
          `Khoảng cách đến KTX: ${dist.toFixed(2)} km\nPhí ship tính theo ${formulaName}: ${fee.toLocaleString('vi-VN')} đ`,
        );
      },
      (error) => {
        setLocating(false);
        // If GPS fails on emulator, use simulated fallback distance
        const mockDist = 2.5;
        const formulaRate = VARIANT.shipFormula === 'A' ? 3000 : 5000;
        const fee = BASE_SHIP_FEE + Math.round(mockDist * formulaRate);
        const formulaName = `Công thức ${VARIANT.shipFormula} (Mô phỏng 2.5km)`;

        setShippingInfo(mockDist, fee, formulaName);
        setCurrentCoords({ lat: 10.83, lng: 106.69 });

        Alert.alert(
          'Vị trí mô phỏng (Emulator) 📍',
          `Không thể lấy GPS thực tế (${error.message}). Đã áp dụng khoảng cách 2.5 km.\nPhí ship: ${fee.toLocaleString('vi-VN')} đ`,
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handleCallHotline = () => {
    Linking.openURL('tel:19001234').catch(() => {
      Alert.alert('Thông báo', 'Không thể thực hiện cuộc gọi trên thiết bị này.');
    });
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const stampText = `TH2 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${examStamp()}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Watermark Top */}
      {VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{stampText}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{STUDENT.hoTen.charAt(0)}</Text>
          </View>
          <Text style={styles.studentName}>{STUDENT.hoTen}</Text>
          <Text style={styles.studentMssv}>MSSV: {STUDENT.mssv}</Text>
          <View style={styles.badgeRoom}>
            <Text style={styles.badgeRoomText}>Phòng: {ROOM_LABEL} · Ký Túc Xá IUH</Text>
          </View>
        </View>

        {/* GPS Location & Shipping Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Định vị GPS & Phí giao hàng</Text>
          <Text style={styles.sectionDesc}>
            Khoảng cách tính theo công thức Haversine từ toạ độ hiện tại tới KTX IUH.
          </Text>

          {currentCoords && (
            <View style={styles.coordBox}>
              <Text style={styles.coordText}>
                Vĩ độ: {currentCoords.lat.toFixed(6)} | Kinh độ: {currentCoords.lng.toFixed(6)}
              </Text>
            </View>
          )}

          <View style={styles.shipInfoRow}>
            <Text style={styles.shipLabel}>Khoảng cách:</Text>
            <Text style={styles.shipValue}>{distanceKm.toFixed(2)} km</Text>
          </View>

          <View style={styles.shipInfoRow}>
            <Text style={styles.shipLabel}>Công thức áp dụng:</Text>
            <Text style={styles.shipFormulaText}>Loại {VARIANT.shipFormula}</Text>
          </View>

          <View style={styles.shipInfoRow}>
            <Text style={styles.shipLabel}>Phí ship hiện tại:</Text>
            <Text style={styles.shipFeeValue}>{shippingFee.toLocaleString('vi-VN')} đ</Text>
          </View>

          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleGetLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.gpsButtonText}>📍 Lấy vị trí GPS hiện tại</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* App Info & Student Stamp */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ℹ️ Thông tin bài thi</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Bài thực hành:</Text>
            <Text style={styles.infoVal}>TH2 - KTXGO</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Exam Stamp:</Text>
            <Text style={styles.stampBadge}>#{examStamp()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Variant Seed:</Text>
            <Text style={styles.infoVal}>Auth: {VARIANT.authField} | Tab: {VARIANT.tabOrder}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.hotlineBtn} onPress={handleCallHotline}>
            <Text style={styles.hotlineBtnText}>📞 Gọi tổng đài KTXGO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Watermark Bottom */}
      {!VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{stampText}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  watermarkContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
  },
  watermarkText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  studentMssv: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  badgeRoom: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeRoomText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  coordBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coordText: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
  },
  shipInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shipLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  shipValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  shipFormulaText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  shipFeeValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  gpsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  gpsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoKey: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  stampBadge: {
    backgroundColor: '#DBEAFE',
    color: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionsContainer: {
    marginTop: 8,
  },
  hotlineBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  hotlineBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
