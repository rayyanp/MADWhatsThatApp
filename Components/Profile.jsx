import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as EmailValidator from 'email-validator';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  headerContainer: {
    backgroundColor: '#2980b9',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 125,
    height: 125,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  noPhotoText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  profileContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  formContainer: {
    paddingTop: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  formSubheading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'stretch',
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    alignSelf: 'stretch',
    marginLeft: 10,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FF4136',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginVertical: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 16,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
  },
});

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      originalData: {},
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      photo: null,
      errorMessage: null,
      loading: true,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;

    this.unsubscribe = navigation.addListener('focus', async () => {
      await this.fetchUserProfile();
      await this.get_profile_image();

      // Pre-populate the form with existing details
      this.setState((prevState) => ({
        originalData: prevState.user,
        firstName: prevState.user.first_name,
        lastName: prevState.user.last_name,
        email: prevState.user.email,
      }));
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('whatsthat_user_id');
      const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');

      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
        headers: {
          'X-Authorization': sessionToken,
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
      this.setState({ errorMessage: error.message, loading: false });
    }
  };

  get_profile_image = async () => {
    try {
      const userId = await AsyncStorage.getItem('whatsthat_user_id');
      const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
        method: 'GET',
        headers: {
          'X-Authorization': sessionToken,
        },
      });
      const blob = await response.blob();
      const data = URL.createObjectURL(blob);

      this.setState({
        photo: data,
      });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  };

  saveProfile = async () => {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    const {
      firstName, lastName, email, originalData, password,
    } = this.state;

    const updatedData = {};

    if (firstName !== originalData.first_name) {
      updatedData.first_name = firstName;
    }

    if (lastName !== originalData.last_name) {
      updatedData.last_name = lastName;
    }

    if (email !== originalData.email) {
      updatedData.email = email;
    }

    if (updatedData.email && !EmailValidator.validate(updatedData.email)) {
      this.setState({ errorMessage: 'Must enter valid email' });
      return;
    }

    if (password !== '') {
      const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
      if (!PASSWORD_REGEX.test(password)) {
        this.setState({
          errorMessage:
            "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
        });
        return;
      }
      updatedData.password = password;
    }

    fetch(`http://localhost:3333/api/1.0.0/user/${userId}`, {
      method: 'PATCH',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (response.status === 200) {
          return response;
        } if (response.status === 400) {
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
      .then((user) => {
        this.setState({ user }, this.fetchUserProfile);
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message });
      });
  };

  render() {
    const {
      user, errorMessage, loading, photo, firstName, lastName, email, password,
    } = this.state;
    const { navigation } = this.props;

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
              onPress={() => navigation.navigate('CameraSend')}
            >
              <Icon name="photo-camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>Change Profile Picture</Text>
            </TouchableOpacity>
            <View style={styles.profileContainer}>
              <Text style={styles.name}>
                {user.first_name}
                {' '}
                {user.last_name}
              </Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formSubheading}>Edit Profile</Text>
              <View>
                <Text style={styles.label}>First Name:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    value={firstName}
                    onChangeText={(val) => this.setState({ firstName: val })}
                  />
                  <Icon name="person" size={24} color="#999" />
                </View>
              </View>

              <View>
                <Text style={styles.label}>Last Name:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    value={lastName}
                    onChangeText={(val) => this.setState({ lastName: val })}
                  />
                  <Icon name="person" size={24} color="#999" />
                </View>
              </View>

              <View>
                <Text style={styles.label}>Email:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    value={email}
                    onChangeText={(val) => this.setState({ email: val })}
                  />
                  <Icon name="email" size={24} color="#999" />
                </View>
              </View>

              <View>
                <Text style={styles.label}>Password:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    value={password}
                    onChangeText={(val) => this.setState({ password: val })}
                    secureTextEntry
                  />
                  <Icon name="lock" size={24} color="#999" />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={this.saveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              {errorMessage !== null && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <TouchableOpacity
                  onPress={() => this.setState({ errorMessage: null })}
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
}
