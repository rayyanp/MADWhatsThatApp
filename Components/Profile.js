import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as EmailValidator from 'email-validator';

export default class ProfileScreen extends Component {
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

  async componentDidMount() {
    await this.fetchUserProfile();
    await this.get_profile_image();
  
    // Pre-populate the form with existing details
    this.setState({
      editedUser: {
        first_name: this.state.user.first_name,
        last_name: this.state.user.last_name,
        email: this.state.user.email,
        password: '',
      },
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
  
    const updatedFields = Object.fromEntries(Object.entries(editedUser).filter(([key, value]) => value !== ''));
  
    if (editedUser.email && !EmailValidator.validate(editedUser.email)) {
      this.setState({ errorMessage: 'Must enter valid email' });
      return;
    }

    const PASSWORD_REGEX = new RegExp(
      '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
    );
    if (editedUser.password && !PASSWORD_REGEX.test(editedUser.password)) {
      this.setState({
        errorMessage:
          "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
      });
      return;
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
        this.setState({ user }, this.fetchUserProfile);
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
  
  render() {
    const { user, editedUser, errorMessage, loading, photo } = this.state;
  
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Profile</Text>
        </View>
  
        {loading ? (
          <ActivityIndicator size="large" color="#6B55E6" />
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.photoContainer}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <Text style={styles.noPhotoText}>No photo</Text>
              )}
            </View>
            <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => this.props.navigation.navigate('CameraSend')}
          >
            <Text style={styles.buttonText}>Change Profile Picture</Text>
          </TouchableOpacity>
            <View style={styles.profileContainer}>
              <Text style={styles.name}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
  
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={editedUser.first_name} // Use editedUser's value if it exists, otherwise use user's value
                onChangeText={text => this.userInput('first_name', text)}
              />
  
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={editedUser.last_name} // Use editedUser's value if it exists, otherwise use user's value
                onChangeText={text => this.userInput('last_name', text)}
              />
  
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={editedUser.email}
                onChangeText={text => this.userInput('email', text)}
              />
  
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={editedUser.password}
                onChangeText={text => this.userInput('password', text)}
                secureTextEntry
              />
  
              <TouchableOpacity style={styles.saveButton} onPress={this.saveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    paddingBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  cameraButton: {
    backgroundColor: '#2980b9',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  profileContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#333',
  },
  formContainer: {
    paddingTop: 30,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  noPhotoText: {
    fontSize: 16,
    color: '#999',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor:'#2980b9',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});  