import React, { useState } from 'react';
import { View, Image, Button, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FLASK_URL } from '@env';
import { TextInput } from 'react-native';

const UploadBlueprint = ({ navigation }) => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].fileName;
      const fileType = result.assets[0].type || 'image/jpg';
      uploadImage(fileUri, fileName, fileType);
    }
  };
  const uploadImage = async (uri, imageName) => {
    try {
      // Fetch the image as a Blob
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const formData = new FormData();
      formData.append('file', blob, imageName); // Correct key and use Blob
  
      const uploadResponse = await fetch(`${FLASK_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });
  
      if (uploadResponse.ok) {
        navigation.navigate('ProcessedImage');
      } else {
        const result = await uploadResponse.json();
        throw new Error(result.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 300,
    margin: 10,
  },
});

export default UploadBlueprint;
