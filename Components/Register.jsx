/* eslint-disable object-shorthand */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import * as EmailValidator from 'email-validator';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Ionicons } from '@expo/vector-icons';
import globalStyles from '../globalStyles';
import WhatsThatLogo from '../assets/images/WhatsThatLogo.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    alignSelf: 'stretch',
    marginLeft: 40,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  createAccountButton: {
    marginTop: 10,
    backgroundColor: 'white',
    borderColor: '#2980b9',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#2980b9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoContainer: {
    top: 20,
  },
  successContainer: {
    backgroundColor: '#eaffea',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginVertical: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successText: {
    color: '#008000',
    fontSize: 14,
    marginLeft: 8,
    marginRight: 16,
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

export default class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
    };

    this.onPressButton = this.onPressButton.bind(this);
  }

  onPressButton() {
    this.setState({ error: '' });
    const {
      firstName, lastName, email, password, confirmPassword,
    } = this.state;
    if (
      !(
        firstName
      && lastName
      && email
      && password
      && confirmPassword
      )
    ) {
      this.setState({
        error: 'Must enter first name, last name, email, password, and confirm password',
      });
      return;
    }

    if (!EmailValidator.validate(email)) {
      this.setState({ error: 'Must enter valid email' });
      return;
    }

    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!PASSWORD_REGEX.test(password)) {
      this.setState({
        error:
        "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
      });
      return;
    }

    if (password !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }

    fetch('http://localhost:3333/api/1.0.0/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            success: true,
          });
        } else if (response.status === 400) {
          throw new Error('Bad Request');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        }
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  render() {
    const {
      firstName, lastName, email, password, confirmPassword, error, success,
    } = this.state;
    const { navigation } = this.props;
    return (
      <View style={globalStyles.container}>
        <View style={[globalStyles.logoContainer, styles.logoContainer]}>
          <Image source={WhatsThatLogo} style={globalStyles.logo} />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          onChangeText={(text) => this.setState({ firstName: text })}
          value={firstName}
        />
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          onChangeText={(text) => this.setState({ lastName: text })}
          value={lastName}
        />
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          onChangeText={(text) => this.setState({ email: text })}
          value={email}
        />
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => this.setState({ password: text })}
          value={password}
        />
        <Text style={styles.label}>Confirm Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          onChangeText={(text) => this.setState({ confirmPassword: text })}
          value={confirmPassword}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={this.onPressButton}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.createAccountText}>Login</Text>
        </TouchableOpacity>
        {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => this.setState({ error: '' })}
            style={styles.closeButton}
          >
            <Ionicons name="close-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        )}
        {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Registration Successful! You may now Login.</Text>
          <TouchableOpacity
            onPress={() => this.setState({ success: false })}
            style={styles.closeButton}
          >
            <Ionicons name="close-circle" size={24} color="black" />
          </TouchableOpacity>
        </View>
        )}
      </View>
    );
  }
}
