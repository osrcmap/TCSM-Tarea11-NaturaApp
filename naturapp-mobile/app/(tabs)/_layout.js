// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../src/context/CartContext';

export default function TabsLayout() {
  const { count } = useCart();
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1A5276',
      tabBarInactiveTintColor: '#95A5A6',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#ECF0F1',
        height: 60,
        paddingBottom: 8,
      },
      headerStyle: { backgroundColor: '#1A5276' },
      headerTintColor: '#FFFFFF',
    }}>
      <Tabs.Screen name="home" options={{
        title: 'Inicio',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="home" size={size} color={color} />,
        headerTitle: 'NaturApp'
      }} />
      <Tabs.Screen name="search" options={{
        title: 'Buscar',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="search" size={size} color={color} />,
      }} />
      <Tabs.Screen name="cart" options={{
        title: 'Carrito',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="cart" size={size} color={color} />,
        tabBarBadge: count > 0 ? count : undefined,
        tabBarBadgeStyle: {
          backgroundColor: '#E74C3C',
          color: '#FFFFFF',
          fontSize: 11,
        },
      }} />
      <Tabs.Screen name="orders" options={{
        title: 'Pedidos',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="receipt" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Perfil',
        tabBarIcon: ({ color, size }) =>
          <Ionicons name="person" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
