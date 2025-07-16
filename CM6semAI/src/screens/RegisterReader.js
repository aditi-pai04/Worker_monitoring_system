import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import {SERVER_URL} from '@env';

const RegisterReader = ({ navigation }) => {
  const [readerId, setReaderId] = useState('');
  const [zoneId, setZoneId] = useState('');

  const handleRegister = async () => {
    if (!readerId || !zoneId) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/register-reader`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/javascript;charset=utf-8',
        },
        body: JSON.stringify({ readerId, zoneId }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'RFID Reader registered successfully!');
        navigation.replace('LoginOptionScreen');
        // Handle success (e.g., navigate to another screen)
      } else {
        Alert.alert('Error', result.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register RFID Reader</Text>
      <TextInput
        style={styles.input}
        value={readerId}
        onChangeText={setReaderId}
        placeholder="Reader ID"
      />
      <TextInput
        style={styles.input}
        value={zoneId}
        onChangeText={setZoneId}
        placeholder="Zone ID"
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default RegisterReader;
