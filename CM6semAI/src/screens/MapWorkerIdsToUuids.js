import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import { SERVER_URL } from '@env';

const MapWorkerIdsToUuids = () => {
  const [workers, setWorkers] = useState([]);
  const [workerUuids, setWorkerUuids] = useState({}); // Store UUIDs by worker ID

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/workers`);
        setWorkers(response.data);
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };

    fetchWorkers();
  }, []);

  const handleUuidChange = (worker_id, uuid) => {
    setWorkerUuids((prevWorkerUuids) => ({
      ...prevWorkerUuids,
      [worker_id]: uuid,
    }));
  };

  const handleMapUuids = async () => {
    try {
      for (const [worker_id, uuid] of Object.entries(workerUuids)) {
        if (uuid) {
          await axios.post(`${SERVER_URL}/workers/map-uuid`, {
            worker_id,
            uuid,
          });
        }
      }
      alert('Worker UUIDs mapped successfully!');
    } catch (error) {
      console.error('Error mapping UUIDs:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map Worker IDs to UUIDs</Text>
      <FlatList
        data={workers}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.workerContainer}>
            <Text style={styles.workerTitle}>Worker {item.name} (ID: {item._id})</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter UUID for Worker ${item._id}`}
              value={workerUuids[item._id] || ''}
              onChangeText={(text) => handleUuidChange(item._id, text)}
            />
          </View>
        )}
      />
      <Button title="Map UUIDs" onPress={handleMapUuids} />
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
  workerContainer: {
    marginBottom: 16,
    width: '80%',
  },
  workerTitle: {
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

export default MapWorkerIdsToUuids;
