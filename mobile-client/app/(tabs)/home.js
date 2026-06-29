// app/(tabs)/home.js
import { View, FlatList, ActivityIndicator, StyleSheet,
         RefreshControl, Text, Alert } from 'react-native';
import { useProducts } from '../../src/hooks/useProducts';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import ProductCard from '../../src/components/ProductCard';
import CategoryChips from '../../src/components/CategoryChips';

export default function HomeScreen() {
  const {
    products, categories, selectedCategory,
    loading, refreshing, hasMore,
    filterByCategory, loadMore, refresh
  } = useProducts();
  const { addItem } = useCart();
  const { user } = useAuth();

  // Agregar al carrito desde la lista: valida sesión y avisa con popups
  const handleAddToCart = async (item) => {
    if (!user) {
      Alert.alert('Inicia sesión requerida',
        'Debes iniciar sesión para agregar productos al carrito.',
        [{ text: 'Entendido' }]);
      return;
    }
    try {
      await addItem(item);
      Alert.alert('Agregado al carrito',
        `${item.name} se agregó a tu carrito.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // Spinner de carga inicial
  if (loading && products.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A5276" />
        <Text style={styles.loadingText}>
          Cargando productos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtros de categoría */}
      <CategoryChips
        categories={categories}
        selected={selectedCategory}
        onSelect={filterByCategory}
      />

      {/* Lista de productos con paginación */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={refresh} colors={['#1A5276']} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <ActivityIndicator style={styles.footer}
              color="#1A5276" />
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No se encontraron productos
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center',
            alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7F8C8D',
                 fontSize: 14 },
  list: { padding: 8 },
  footer: { paddingVertical: 20 },
  empty: { textAlign: 'center', marginTop: 40,
           color: '#95A5A6', fontSize: 16 }
});
