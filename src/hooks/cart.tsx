import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prods = await AsyncStorage.getItem('@GoMarketplace:products');
      const productsCart = JSON.parse(prods);
      if (prods) {
        setProducts(productsCart);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART;
      const cart = [...products];
      if (cart.length > 0) {
        const productIndex = cart.findIndex(item => item.id === product.id);
        if (productIndex !== -1) {
          cart[productIndex].quantity += 1;
          setProducts(cart);
          await AsyncStorage.setItem(
            '@GoMarketplace:products',
            JSON.stringify(cart),
          );
        } else {
          product.quantity = 1;
          cart.push(product);
          AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(cart));
          setProducts(cart);
        }
      } else {
        product.quantity = 1;
        cart.push(product);
        AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(cart));
        setProducts(cart);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const cart = [...products];
      const productIndex = cart.findIndex(product => product.id === id);

      if (productIndex !== -1) {
        cart[productIndex].quantity += 1;
        setProducts(cart);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const cart = [...products];
      const productIndex = cart.findIndex(product => product.id === id);

      if (productIndex !== -1) {
        cart[productIndex].quantity -= 1;
        setProducts(cart);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
