import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Product } from '../api/apiClient';
import { useCartStore } from '../store/cartStore';
import { STUDENT, VARIANT, examStamp, PRICE_MULTIPLIER } from '../constants/student';
import { COLORS } from '../constants/theme';

export const ProductDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const product: Product = route.params?.product;

  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Không tìm thấy thông tin sản phẩm.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const unitPrice = Math.round(product.price * PRICE_MULTIPLIER);
  const formattedUnitPrice = unitPrice.toLocaleString('vi-VN') + ' đ';
  const formattedTotalPrice = (unitPrice * quantity).toLocaleString('vi-VN') + ' đ';

  const handleAddToCart = () => {
    try {
      ReactNativeHapticFeedback.trigger(
        VARIANT.hapticOnAdd === 'impact' ? 'impactMedium' : 'selection',
      );
    } catch (e) {
      // Fallback
    }

    addToCart(
      {
        id: product.id,
        title: product.title,
        price: unitPrice,
        image: product.image,
        category: product.category,
      },
      quantity,
    );

    Alert.alert(
      'Thành công 🎉',
      `Đã thêm ${quantity} món vào giỏ hàng!\n\nSinh viên: ${STUDENT.hoTen}\nMSSV: ${STUDENT.mssv}`,
      [
        {
          text: 'Tiếp tục mua sắm',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Xem giỏ hàng',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
        },
      ],
    );
  };

  const stampText = `TH2 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${examStamp()}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Watermark */}
      {VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{stampText}</Text>
        </View>
      )}

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>‹ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết món
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageCard}>
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
        </View>

        {/* Product Details */}
        <View style={styles.infoCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category.toUpperCase()}</Text>
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.starText}>⭐ {product.rating?.rate || 4.5}</Text>
            <Text style={styles.ratingCount}>({product.rating?.count || 120} đánh giá)</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Đơn giá:</Text>
            <Text style={styles.priceValue}>{formattedUnitPrice}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addCartBtnText}>
            Thêm ({formattedTotalPrice})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Watermark */}
      {!VARIANT.watermarkAtTop && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>{stampText}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBackBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerBackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  imageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImage: {
    width: '100%',
    height: 220,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 11,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D97706',
    marginRight: 6,
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textLight,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 6,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  qtyText: {
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addCartBtn: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addCartBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
