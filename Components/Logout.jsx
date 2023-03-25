/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../globalStyles';
import WhatsThatLogo from '../assets/images/WhatsThatLogo.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#2980b6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  errorText: {
    color: '#f00',
    textAlign: 'center',
    marginVertical: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmContainer: {
    alignItems: 'center',
  },
  confirmText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#2980b6',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dcdcdc',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
});

export default class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
    };
  }

  logout = async () => {
    console.log('logout');
    const { navigation } = this.props;
    this.setState({ loading: true });

    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      });

      if (response.status === 200) {
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
      } else if (response.status === 401) {
        console.log('Unauthorized');
        await AsyncStorage.removeItem('whatsthat_session_token');
        await AsyncStorage.removeItem('whatsthat_user_id');
        navigation.navigate('Login');
      } else if (response.status === 500) {
        throw new Error('Server error');
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      this.setState({ loading: false, error: error.message });
    }
  };

  render() {
    const { loading, error, showConfirmation } = this.state;

    return (
      <View style={globalStyles.container}>
        <View style={[globalStyles.logoContainer, styles.logoContainer]}>
          <Image source={WhatsThatLogo} style={globalStyles.logo} />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {showConfirmation ? (
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmText}>Are you sure you want to logout?</Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={this.logout}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.buttonText}>Loading...</Text>
              ) : (
                <Text style={styles.buttonText}>Yes, logout</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => this.setState({ showConfirmation: false })}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => this.setState({ showConfirmation: true })}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.buttonText}>Loading...</Text>
            ) : (
              <Text style={styles.buttonText}>Logout</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
