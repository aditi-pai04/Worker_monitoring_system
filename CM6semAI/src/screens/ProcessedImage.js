import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import {FLASK_URL} from '@env';

const ProcessedImage = () => {
  const imageUrl = `${FLASK_URL}/processed-image`;  // Assuming Flask serves this image at this URL

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
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
    width: '50%',
    height: '90%',
    resizeMode: 'contain',
  },
});

export default ProcessedImage;