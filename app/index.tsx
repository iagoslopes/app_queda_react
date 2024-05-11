import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
 
export default function Index() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState<Location.LocationObject>({coords: {latitude:0,
                                                    longitude:0, accuracy: 0, altitude:0,
                                              altitudeAccuracy: 0, heading: 0, speed: 0},
                                                    timestamp:0});
  const [errorMsg, setErrorMsg] = useState('');
 
  const subscribe = () => {
    Accelerometer.setUpdateInterval(500);
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
      checkForFall(accelerometerData);
    });
    return subscription;
  };
 
  const unsubscribe = () => {
    Accelerometer.removeAllListeners();
  };
 
  const checkForFall = async ({ x, y, z }: {x:number, y:number, z:number}) => {
    const limit = 1.5; // Limite de aceleração para detecção de queda
    if (Math.abs(x) > limit || Math.abs(y) > limit || Math.abs(z) > limit) {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      alertFall(location);
    }
  };
 
  const alertFall = (location: Location.LocationObject) => {
    Alert.alert(
      "Queda Detectada",
      `Uma queda foi detectada. Localização: ${location.coords.latitude},
      ${location.coords.longitude}`,
      [{ text: "OK" }]
    );
  };
 
 
  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);
 
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();
  }, []);
 
 
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detector de Quedas</Text>
      <Text style={styles.text}>{errorMsg ? errorMsg : `Latitude: ${location ? location.coords.latitude : ''}, Longitude: ${location ? location.coords.longitude : ''}`}</Text>
      <Text style={styles.text}>{errorMsg ? errorMsg : `X: ${ data.x}, Y:${data.y}, Z: ${data.z}`}</Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
  },
});
