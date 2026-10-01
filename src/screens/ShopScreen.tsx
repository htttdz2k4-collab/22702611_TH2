import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useNavigation } from '@react-navigation/native';
import { fetchProducts, Product } from '../api/apiClient';
import { useDebounce } from '../hooks/useDebounce';
import { useCartStore } from '../store/cartStore';
import { STUDENT, VARIANT, examStamp, DEBOUNCE_MS, STALE_TIME_MS, PRICE_MULTIPLIER, ROOM_LABEL } from '../constants/student';
import { COLORS } from '../constants/theme';

const CATEGORIES = ['all', "men's clothing", "women's clothing", 'jewelery', 'electronics'];

export const ShopScreen = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);
  const addToCart = useCartStore((state) => state.addToCart);

  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
    staleTime: STALE_TIME_MS,
  });

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return products;
    return products.filter((item) =>
      item.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [products, debouncedSearch]);

  const handleAddToCart = (item: Product) => {
    try {
      ReactNativeHapticFeedback.trigger(
        VARIANT.hapticOnAdd === 'impact' ? 'impactMedium' : 'selection',
      );
    } catch (e) {
      // Ignored for emulator fallback
    }

    addToCart(
      {
        id: item.id,
        title: item.title,
        price: Math.round(item.price * PRICE_MULTIPLIER),
        image: item.image,
        category: item.category,
      },
      1,
    );
  };

  const stampText = `TH2 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${examStamp()}`;

  const renderProductItem = ({ item }: { item: Product }) => {
    const formattedPrice = (Math.round(item.price * PRICE_MULTIPLIER)).toLocaleString('vi-VN') + ' đ';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
        <View style={styles.cardContent}>
          <Text style={styles.cardCategory} numberOfLines={1}>
            {item.category.toUpperCase()}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardPrice}>{formattedPrice}</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>+ Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Watermark Top */}
      {VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{stampText}</Text>
        </View>
      )}

      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>KTXGO MART</Text>
          <Text style={styles.headerSub}>Giao nhanh {ROOM_LABEL} · Ký Túc Xá</Text>
        </View>
        <View style={styles.badgeMssv}>
          <Text style={styles.badgeMssvText}>{STUDENT.mssv}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm món đồ bạn thích..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <View style={styles.categoryList}>
        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.catPill, isSelected && styles.catPillActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {item === 'all' ? 'Tất cả' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 3 Network States */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.statusText}>Đang tải danh sách món...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Lỗi kết nối mạng: {(error as any)?.message || 'Thử lại sau'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={filteredProducts}
            renderItem={renderProductItem}
            numColumns={2}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* Watermark Bottom */}
      {!VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{stampText}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ShopScreen;

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  badgeMssv: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeMssvText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 14,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 28,
    top: 12,
  },
  clearSearchText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
  categoryList: {
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  catPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catPillText: {
    fontSize: 13,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  catPillTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: 6,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardCategory: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    minHeight: 34,
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 10,
    color: COLORS.textLight,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 15,
  },
});
