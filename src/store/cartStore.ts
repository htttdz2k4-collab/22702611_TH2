import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STUDENT, BASE_SHIP_FEE, VARIANT } from '../constants/student';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  distanceKm: number;
  shippingFee: number;
  shippingFormula: string;
  addToCart: (product: { id: number; title: string; price: number; image: string; category?: string }, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  setShippingInfo: (distance: number, fee: number, formula: string) => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      distanceKm: 0,
      shippingFee: BASE_SHIP_FEE,
      shippingFormula: VARIANT.shipFormula === 'A' ? 'Base + dist*3000' : 'Base + dist*5000',

      addToCart: (product, quantity = 1) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((i) => i.id === product.id);

        if (existingIndex > -1) {
          const newCart = [...currentCart];
          newCart[existingIndex].quantity += quantity;
          set({ cart: newCart });
        } else {
          set({
            cart: [
              ...currentCart,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category || '',
                quantity: quantity,
              },
            ],
          });
        }
      },

      removeFromCart: (id: number) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },

      updateQuantity: (id: number, delta: number) => {
        const currentCart = get().cart;
        const newCart = currentCart
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[];

        set({ cart: newCart });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      setShippingInfo: (distance: number, fee: number, formula: string) => {
        set({ distanceKm: distance, shippingFee: fee, shippingFormula: formula });
      },

      getTotalItems: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotal: () => {
        return get().getSubtotal() + get().shippingFee;
      },
    }),
    {
      name: `cart-storage-${STUDENT.mssv}`,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
