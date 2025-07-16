import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { SERVER_URL } from '@env';

const RegisterWorker = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // const [rfidId, setRfidId] = useState('');
  const [uuid, setUuid] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !phoneNumber || !uuid) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/register-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/javascript;charset=utf-8',
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          uuid,  // Add the uuid to the request body
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Worker registered successfully!');
        navigation.replace('LoginOptionScreen');
        // Clear fields or navigate to another screen
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
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter worker's name"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter worker's email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone Number:</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter worker's phone number"
        keyboardType="phone-pad"
      />
{/* 
      <Text style={styles.label}>RFID ID:</Text>
      <TextInput
        style={styles.input}
        value={rfidId}
        onChangeText={setRfidId}
        placeholder="Enter RFID ID"
      /> */}

      <Text style={styles.label}>UUID:</Text>
      <TextInput
        style={styles.input}
        value={uuid}
        onChangeText={setUuid}
        placeholder="Enter UUID"
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
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default RegisterWorker;
