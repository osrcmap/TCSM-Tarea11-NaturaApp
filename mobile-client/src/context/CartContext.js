// src/context/CartContext.js
// Comparte un único estado de carrito en toda la app (para que el badge del
// ícono y la pantalla del carrito queden sincronizados). Reutiliza el hook
// useCart existente, llamándolo una sola vez dentro del proveedor.
import { createContext, useContext } from 'react';
import { useCart as useCartState } from '../hooks/useCart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const cart = useCartState();
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
