import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SERVER_URL } from '@env';

const ViewWorkerLog = ({ navigation }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/workers`);
        const data = await response.json();
        setWorkers(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch workers');
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
console.log(workers);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select a Worker to View Logs</Text>
      {workers.map(worker => (
        <View key={worker._id} style={styles.buttonContainer}>
          <Button
            title={worker.name}
            onPress={() => {console.log(worker.uuid); navigation.navigate('WorkerLogs', { workerUuid: worker.uuid })}}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  buttonContainer: {
    marginVertical: 5,
    width: '80%',
  },
});

export default ViewWorkerLog;
