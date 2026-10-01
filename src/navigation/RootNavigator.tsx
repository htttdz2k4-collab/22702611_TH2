import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { LoginScreen } from '../screens/LoginScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { VARIANT } from '../constants/student';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const renderShopIcon = () => <Text style={styles.tabIcon}>🛍️</Text>;
const renderCartIcon = () => <Text style={styles.tabIcon}>🛒</Text>;
const renderProfileIcon = () => <Text style={styles.tabIcon}>👤</Text>;

const MainTabs = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());

  const shopTab = (
    <Tab.Screen
      key="Shop"
      name="Shop"
      component={ShopScreen}
      options={{
        title: 'Cửa hàng',
        tabBarIcon: renderShopIcon,
      }}
    />
  );

  const cartTab = (
    <Tab.Screen
      key="Cart"
      name="Cart"
      component={CartScreen}
      options={{
        title: 'Giỏ hàng',
        tabBarBadge: totalItems > 0 ? totalItems : undefined,
        tabBarIcon: renderCartIcon,
      }}
    />
  );

  const profileTab = (
    <Tab.Screen
      key="Profile"
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Cá nhân',
        tabBarIcon: renderProfileIcon,
      }}
    />
  );

  const tabsInOrder =
    VARIANT.tabOrder === 'cartFirst'
      ? [cartTab, shopTab, profileTab]
      : [shopTab, cartTab, profileTab];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {tabsInOrder}
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{
              presentation: VARIANT.detailPresentation === 'modal' ? 'modal' : 'card',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RootNavigator;
