import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileScreen extends Component {
  state = {
    user: {},
    editedUser: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
    photo: null,
    errorMessage: null,
    loading: true,
  };

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
    this.fetchUserProfile();
    this.get_profile_image();
  });
  }

  fetchUserProfile = async () => {
    try {
      const user_id = await AsyncStorage.getItem('whatsthat_user_id');
      const session_token = await AsyncStorage.getItem('whatsthat_session_token');
      
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/`+user_id, {
        headers: {
          'X-Authorization': session_token,
          Accept: 'application/json',
        },
      });
  
      if (response.status === 200) {
        const user = await response.json();
        this.setState({ user, loading: false });
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Error');
      }
    } catch (error) {
      console.error(error);
      this.setState({ errorMessage: error.message, loading: false });
    }
  };
  

  get_profile_image = async () => {
    try {
      const user_id = await AsyncStorage.getItem('whatsthat_user_id');
      const session_token = await AsyncStorage.getItem('whatsthat_session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/`+user_id+`/photo`, {
        method: 'GET',
        headers: {
          'X-Authorization': session_token,
        },
      });
      const blob = await response.blob();
      const data = URL.createObjectURL(blob);
  
      this.setState({
        photo: data,
        isLoading: false,
      });
    } catch (err) {
      console.log(err);
    }
  }  

  saveProfile = async () => {
    const user_id = await AsyncStorage.getItem('whatsthat_user_id');
    const { editedUser } = this.state;

    // Remove empty fields from the editedUser object
    const updatedFields = {};
    for (const key in editedUser) {
      if (editedUser[key] !== '') {
        updatedFields[key] = editedUser[key];
      }
    }

    fetch(`http://localhost:3333/api/1.0.0/user/`+user_id, {
      method: 'PATCH',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFields),
    })
      .then(response => {
        if (response.status === 200) {
          return response;
        } else if (response.status === 400) {
          throw new Error('Please enter a valid email address and a password strong enough (One upper, one lower, one special, one number, at least 8 characters long)');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        } else {
          throw new Error('Error');
        }
      })
      .then(user => {
        this.setState({ user }, () => {
          this.fetchUserProfile(); // Call fetchUserProfile again to update state with the latest user details
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({ errorMessage: error.message });
      });
  };

  userInput = (key, value) => {
    this.setState({
      editedUser: {
        ...this.state.editedUser,
        [key]: value,
      },
    });
  };
  


