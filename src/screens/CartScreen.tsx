import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useCartStore, CartItem } from '../store/cartStore';
import { STUDENT, VARIANT, examStamp, ROOM_LABEL } from '../constants/student';
import { COLORS } from '../constants/theme';

export const CartScreen = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    distanceKm,
    shippingFee,
    shippingFormula,
    getSubtotal,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const total = getTotal();

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống!');
      return;
    }

    Alert.alert(
      'Xác nhận đặt hàng 🚀',
      `Người nhận: ${STUDENT.hoTen}\nMSSV: ${STUDENT.mssv}\nĐịa chỉ giao: ${ROOM_LABEL} - KTX\n\nTổng thanh toán: ${total.toLocaleString('vi-VN')} đ\n(Gồm ${shippingFee.toLocaleString('vi-VN')} đ phí ship)`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý đặt',
          onPress: () => {
            clearCart();
            Alert.alert('Thành công 🎉', 'Đơn hàng của bạn đã được ghi nhận và đang chuẩn bị giao!');
          },
        },
      ],
    );
  };

  const stampText = `TH2 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${examStamp()}`;

  const renderItem = ({ item }: { item: CartItem }) => {
    const itemTotal = (item.price * item.quantity).toLocaleString('vi-VN') + ' đ';

    return (
      <View style={styles.cartCard}>
        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>

          <View style={styles.itemActions}>
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTotalText}>{itemTotal}</Text>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => removeFromCart(item.id)}
            >
              <Text style={styles.deleteBtnText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Giỏ hàng KTXGO</Text>
          <Text style={styles.headerSub}>Phòng nhận: {ROOM_LABEL}</Text>
        </View>
        {cart.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Xóa hết</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main List */}
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptySub}>Hãy thêm món đồ yêu thích từ Cửa Hàng nhé!</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Summary Box */}
      {cart.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền hàng ({cart.length} món):</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')} đ</Text>
          </View>

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Phí giao hàng ({distanceKm.toFixed(1)} km):</Text>
              <Text style={styles.formulaTag}>Công thức {VARIANT.shipFormula}: {shippingFormula}</Text>
            </View>
            <Text style={styles.shippingFeeText}>+{shippingFee.toLocaleString('vi-VN')} đ</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} đ</Text>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>TIẾN HÀNH ĐẶT HÀNG</Text>
          </TouchableOpacity>
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

export default CartScreen;

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
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  clearAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  clearAllText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 4,
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  qtyText: {
    marginHorizontal: 8,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemTotalText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  formulaTag: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },
  shippingFeeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
