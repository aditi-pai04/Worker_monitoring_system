import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import { SERVER_URL } from '@env';

const MapRfidToZones = () => {
  const [zones, setZones] = useState([]);
  const [espUuids, setEspUuids] = useState({}); // Use an object to store ESP UUIDs by zone_id

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/zones`);
        setZones(response.data);
      } catch (error) {
        console.error('Error fetching zones:', error);
      }
    };

    fetchZones();
  }, []);

  const handleEspUuidChange = (zone_id, uuid) => {
    setEspUuids((prevEspUuids) => ({
      ...prevEspUuids,
      [zone_id]: uuid,
    }));
  };

  const handleMapEsp = async () => {
    try {
      const blueprintName = 'floor_pan.jpg'; // Hardcoded blueprint name
      for (const [zone_id, esp_uuid] of Object.entries(espUuids)) {
        if (esp_uuid) {
          await axios.post(
            `${SERVER_URL}/zones/map-esp`,
            {
              zone_id,
              esp_uuid,
              blueprint_name: blueprintName, // Include blueprint name in the request
            },
            {
              headers: {
                'Content-Type': 'application/javascript', // Set Content-Type explicitly
              },
            }
          );
        }
      }
      alert('ESP UUIDs mapped to zones successfully!');
    } catch (error) {
      console.error('Error mapping ESP UUIDs:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map RFID to Zones</Text>
      <FlatList
        data={zones}
        keyExtractor={(item) => item.zone_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.zoneContainer}>
            <Text style={styles.zoneTitle}>Zone {item.zone_id}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ESP UUID for Zone ${item.zone_id}`}
              value={espUuids[item.zone_id] || ''}
              onChangeText={(text) => handleEspUuidChange(item.zone_id, text)}
            />
          </View>
        )}
      />
      <Button title="Map ESPs" onPress={handleMapEsp} />
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
  zoneContainer: {
    marginBottom: 16,
    width: '80%',
  },
  zoneTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
});

export default MapRfidToZones;
