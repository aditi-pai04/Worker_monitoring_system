// RegisterScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity ,ScrollView} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import {SERVER_URL} from '@env';


const RegisterManager = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [blueprintImage, setBlueprintImage] = useState(null);
  const [password, setPassword] = useState(''); 

  const handleRegister = async () => {
    if (!name || !phoneNumber || !email || !location || !password || !blueprintImage) {
      Alert.alert('Error', 'Please fill out all fields and upload an image.');
      return;
    }
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phoneNumber', phoneNumber);
    formData.append('email', email);
    formData.append('location', location);
    formData.append('password', password);
    formData.append('blueprintImage', {
      uri: blueprintImage,
      name: 'blueprint.jpg',
      type: 'image/jpeg',
    });
  console.log(formData)
    try {
      const response = await fetch(`${SERVER_URL}/register`, {
        method: 'POST',
        body: formData,  // Do not set Content-Type header manually
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', result.message);
        navigation.replace('Login');  // Navigate to the Login screen
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };
  
  const pickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setBlueprintImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Phone Number:</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />
    <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry={true} // Hide password input
      />

      <Text style={styles.label}>Location of Building:</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Enter building location"
      />

      <Text style={styles.label}>Blueprint Image:</Text>
      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>Pick an image</Text>
      </TouchableOpacity>

      {blueprintImage && (
        <Image source={{ uri: blueprintImage }} style={styles.imagePreview} />
      )}

      <Button title="Register" onPress={handleRegister} />
    </View>
    </ScrollView>
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
  imagePicker: {
    backgroundColor: '#ddd',
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#333',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 16,
  },
});

export default RegisterManager;
