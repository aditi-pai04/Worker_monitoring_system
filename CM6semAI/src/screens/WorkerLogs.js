import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SERVER_URL } from '@env';

const WorkerLogs = ({ route }) => {
  const { workerUuid } = route.params;
  console.log('Worker UUID:', workerUuid); // Debugging

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerUuid) {
      Alert.alert('Error', 'Worker UUID is missing');
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        const encodedUuid = encodeURIComponent(workerUuid);
        const response = await fetch(`${SERVER_URL}/logdata?uuid=${encodedUuid}`);
        const data = await response.json();
        console.log(data)
        setLogs(data[0].logs);
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch logs');
        setLoading(false);
      }
    };

    fetchLogs();
  }, [workerUuid]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last 10 Logs</Text>
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <View key={index} style={styles.logContainer}>
            <Text>{`Scanner ID: ${log.scannerId}`}</Text>
            <Text>{`Timestamp: ${log.timestamp}`}</Text>
          </View>
        ))
      ) : (
        <Text>No logs available for this worker</Text>
      )}
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
  logContainer: {
    marginBottom: 10,
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});

export default WorkerLogs;
