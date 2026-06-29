// src/context/AuthContext.js
// Comparte el estado de autenticación en toda la app. Al montarse una sola vez
// en la raíz, restaura la sesión (token) al arrancar, dejando `user` disponible
// globalmente (p.ej. para saber si se puede agregar al carrito). Reutiliza el
// hook useAuth existente.
import { createContext, useContext } from 'react';
import { useAuth as useAuthState } from '../hooks/useAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuthState();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
