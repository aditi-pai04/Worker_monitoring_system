import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterManager from './src/screens/RegisterManager'; // Your registration screen
import LoginManager from './src/screens/LoginManager';
import HomeScreen from './src/screens/HomeScreen';
import LoginOptionScreen from './src/screens/LoginOptionScreen';
import RegisterWorker from './src/screens/RegisterWorker';
import RegisterReader from './src/screens/RegisterReader';
import ViewWorkerLog from './src/screens/ViewWorkerLog';
import UploadBlueprint from './src/screens/UploadBlueprint';
import MapRfidToZones from './src/screens/MapRfidToZones';
import LiveMapping from './src/screens/LiveMapping';
import ProcessedImage from './src/screens/ProcessedImage';
import MapWorkerIdsToUuids from './src/screens/MapWorkerIdsToUuids';
import WorkerLogs from './src/screens/WorkerLogs';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LoginOptionScreen" component={LoginOptionScreen} />
        <Stack.Screen name="Register" component={RegisterManager} />
        <Stack.Screen name="RegisterReader" component={RegisterReader} />
        <Stack.Screen name="RegisterWorker" component={RegisterWorker} />
        <Stack.Screen name="UploadBlueprint" component={UploadBlueprint} />
        <Stack.Screen name="MapRfidToZones" component={MapRfidToZones} />
        <Stack.Screen name="LiveMapping" component={LiveMapping} />
        <Stack.Screen name="Login" component={LoginManager} />
        <Stack.Screen name="ProcessedImage" component={ProcessedImage} />
        <Stack.Screen name="MapWorkerIdsToUuids" component={MapWorkerIdsToUuids} />
        <Stack.Screen name="ViewWorkerLog" component={ViewWorkerLog} />
        <Stack.Screen name="WorkerLogs" component={WorkerLogs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
