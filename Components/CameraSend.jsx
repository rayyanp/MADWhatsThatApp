/* eslint-disable react/jsx-no-bind */
import React, { useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    padding: 5,
    margin: 5,
    backgroundColor: 'steelblue',
  },
  button: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd',
  },
});

export default function CameraSendToServer() {
  const [type, setType] = useState(CameraType.back);
  const [permission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null);

  function toggleCameraType() {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
    console.log('Camera: ', type);
  }

  async function takePhoto() {
    if (camera) {
      // eslint-disable-next-line no-use-before-define
      const options = { quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data) };
      // eslint-disable-next-line no-unused-vars
      const data = await camera.takePictureAsync(options);
    }
  }

  async function sendToServer(data) {
    console.log('HERE', data.uri);

    const id = await AsyncStorage.getItem('whatsthat_user_id');
    const token = await AsyncStorage.getItem('whatsthat_session_token');

    const res = await fetch(data.uri);
    const blob = await res.blob();

    return fetch(`http://localhost:3333/api/1.0.0/user/${id}/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        'X-Authorization': token,
      },
      body: blob,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('Picture added', response);
        } else if (response.status === 400) {
          console.log('Bad request');
        } else if (response.status === 401) {
          console.log('Unauthorised');
        } else if (response.status === 403) {
          console.log('Forbidden');
        } else if (response.status === 404) {
          console.log('Not Found');
        } else if (response.status === 500) {
          console.log('Server Error');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (!permission || !permission.granted) {
    return (<Text>No access to camera</Text>);
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}
