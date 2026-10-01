import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
import { ProductCard } from '../components/ProductCard';
import { useDebounce } from '../hooks/useDebounce';
import { STUDENT, examStamp, VARIANT, DEBOUNCE_MS } from '../constants/student';

const FALLBACK_PRODUCTS = [
    { id: 1, title: 'Balo chống nước KTX', price: 15, image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg', category: "men's clothing" },
    { id: 2, title: 'Áo thun Slim Fit KTXGO', price: 22, image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UT_.jpg', category: "men's clothing" },
    { id: 3, title: 'Áo khoác Cotton Jacket', price: 55, image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg', category: "men's clothing" },
    { id: 4, title: 'Vòng tay bạc IUH KTX', price: 45, image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg', category: 'jewelery' },
    { id: 5, title: 'Ổ cứng SSD di động 1TB', price: 109, image: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg', category: 'electronics' },
    { id: 6, title: 'Màn hình Gaming 24 inch', price: 159, image: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg', category: 'electronics' },
];

const fetchProducts = async () => {
    try {
        const response = await axiosClient.get('https://fakestoreapi.com/products');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data;
        }
        return FALLBACK_PRODUCTS;
    } catch {
        return FALLBACK_PRODUCTS;
    }
};

export const ShopScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_MS);

    const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });

    const filteredData = (data || []).filter((item: any) =>
        (item.title || item.name || '').toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Watermark ở trên hoặc dưới theo VARIANT */}
            {VARIANT.watermarkAtTop && (
                <View style={styles.watermark}>
                    <Text style={styles.wmText}>
                        TH2 · {STUDENT.mssv} · {STUDENT.hoTen} · {examStamp()}
                    </Text>
                </View>
            )}

            <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Trạng thái Pending (Đang tải) */}
            {isLoading && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1A56DB" />
                    <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
            )}

            {/* Trạng thái Error (Mất mạng / Lỗi API) */}
            {isError && (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorTitle}>LỖI TẢI DỮ LIỆU</Text>
                    <Text style={styles.errorText}>
                        Sinh viên: {STUDENT.hoTen} ({STUDENT.mssv})
                    </Text>
                    <Text style={styles.errorSub}>{(error as Error)?.message || 'Không thể kết nối máy chủ'}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => { refetch(); }}>
                        <Text style={styles.retryBtnText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Trạng thái Data (Danh sách FlashList) */}
            {!isLoading && !isError && (
                <View style={styles.listContainer}>
                    <FlashList
                        data={filteredData}
                        renderItem={({ item }) => (
                            <ProductCard
                                item={item}
                                onPress={() => navigation.navigate('ProductDetail', { id: String(item.id) })}
                            />
                        )}
                        numColumns={2}
                        keyExtractor={item => `${STUDENT.mssv}_${item.id}`}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} colors={['#1A56DB']} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {!VARIANT.watermarkAtTop && (
                <View style={styles.watermark}>
                    <Text style={styles.wmText}>
                        TH2 · {STUDENT.mssv} · {STUDENT.hoTen} · {examStamp()}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    watermark: { backgroundColor: '#E0E7FF', paddingVertical: 4, alignItems: 'center' },
    wmText: { fontSize: 11, fontWeight: 'bold', color: '#3730A3' },
    header: { padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    searchInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
    },
    listContainer: { flex: 1, paddingHorizontal: 8 },
    listContent: { paddingVertical: 8 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, color: '#6B7280' },
    errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#DC2626', marginBottom: 8 },
    errorText: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
    errorSub: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
    retryBtn: { backgroundColor: '#1A56DB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    retryBtnText: { color: '#FFF', fontWeight: 'bold' },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#9CA3AF' },
});