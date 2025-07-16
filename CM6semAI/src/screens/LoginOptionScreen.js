import React from 'react';
import { View, Text, Button, StyleSheet,ScrollView } from 'react-native';

const LoginOptionScreen = ({ navigation }) => {
  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.title}>Choose an Option</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Register worker"
          onPress={() => navigation.navigate('RegisterWorker')}  // Navigate to Option1Screen
        />
      </View>
{/* 
      <View style={styles.buttonContainer}>
        <Button
          title="Register reader"
          onPress={() => navigation.navigate('RegisterReader')}  // Navigate to Option2Screen
        />
      </View> */}

      <View style={styles.buttonContainer}>
        <Button
          title="View log"
          onPress={() => navigation.navigate('ViewWorkerLog')}  // Navigate to Option3Screen
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Upload Blueprint"
          onPress={() => navigation.navigate('UploadBlueprint')}  // Navigate to UploadBlueprint screen
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Map RFID to Zones"
          onPress={() => navigation.navigate('MapRfidToZones')}  // Navigate to MapRfidToZones screen
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Live Mapping"
          onPress={() => navigation.navigate('LiveMapping')}  // Navigate to LiveMapping screen
        />
      </View>
{/* 
      <View style={styles.buttonContainer}>
        <Button
          title="Map Worker IDs to UUIDs"
          onPress={() => navigation.navigate('MapWorkerIdsToUuids')}
        />
      </View> */}
    </View>
    </ScrollView>
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
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
});

export default LoginOptionScreen;
