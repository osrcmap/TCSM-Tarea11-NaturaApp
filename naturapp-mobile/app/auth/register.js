// app/auth/register.js
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,
         ActivityIndicator, StyleSheet, Alert,
         ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error',
        'Completa nombre, correo y contraseña');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error',
        'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      // POST /users/register a través de useAuth
      await register({ name, email, password, phone });
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Error de registro', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>
        Únete a NaturApp y compra productos naturales
      </Text>

      <TextInput style={styles.input}
        placeholder="Nombre completo"
        value={name} onChangeText={setName} />

      <TextInput style={styles.input}
        placeholder="Correo electrónico"
        value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" />

      <TextInput style={styles.input}
        placeholder="Teléfono (opcional)"
        value={phone} onChangeText={setPhone}
        keyboardType="phone-pad" />

      <TextInput style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password} onChangeText={setPassword}
        secureTextEntry />

      <TouchableOpacity style={styles.button}
        onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Registrarme</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/auth/login')}>
        <Text style={styles.link}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFF',
               padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold',
           color: '#1A5276', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7F8C8D',
              textAlign: 'center', marginTop: 8,
              marginBottom: 32 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1,
           borderColor: '#D5DBDB', borderRadius: 10,
           padding: 14, fontSize: 16, marginBottom: 14 },
  button: { backgroundColor: '#148F77', padding: 16,
            borderRadius: 12, alignItems: 'center',
            marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 17,
                fontWeight: 'bold' },
  link: { color: '#2E86C1', textAlign: 'center',
          marginTop: 24, fontSize: 14 }
});
