import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {FLASK_URL} from '@env';

const LiveMapping = () => {
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    const fetchLiveMap = async () => {
      try {
        const response = await fetch(`${FLASK_URL}/live-map`);
        const data = await response.json();
        setImageUri(data.image_url);  // Use the URL provided by Flask
      } catch (error) {
        console.error('Error fetching live map:', error);
      }
    };

    fetchLiveMap();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Mapping</Text>
      {imageUri ? (
        <Image 
        source={{ uri: imageUri }} 
        style={styles.image} 
        resizeMode="contain"  // or 'cover', 'stretch'
      />
      ) : (
        <Text>No live data available</Text>
      )}
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
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  image: {
    width: '50%',
    height: '100%',
  },
});

export default LiveMapping;
