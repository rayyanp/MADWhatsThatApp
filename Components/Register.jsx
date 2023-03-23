/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
} from 'react-native';
import * as EmailValidator from 'email-validator';
import globalStyles from '../globalStyles';

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
  error: {
    color: 'red',
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
});

export default class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      error: '',
    };

    this.onPressButton = this.onPressButton.bind(this);
  }

  onPressButton() {
    this.setState({ error: '' });
    const {
      first_name, last_name, email, password, confirm_password,
    } = this.state;
    if (
      !(
        first_name
      && last_name
      && email
      && password
      && confirm_password
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

    if (password !== confirm_password) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }

    fetch('http://localhost:3333/api/1.0.0/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: '',
            success: true,
          });
        } else if (response.status === 400) {
          throw new Error('Bad Request');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        }
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          error: 'An error occurred during registration',
        });
      });
  }

  render() {
    const {
      first_name, last_name, email, password, confirm_password, error, success,
    } = this.state;
    const { navigation } = this.props;
    return (
      <View style={globalStyles.container}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          onChangeText={(text) => this.setState({ first_name: text })}
          value={first_name}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          onChangeText={(text) => this.setState({ last_name: text })}
          value={last_name}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          onChangeText={(text) => this.setState({ email: text })}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => this.setState({ password: text })}
          value={password}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          onChangeText={(text) => this.setState({ confirm_password: text })}
          value={confirm_password}
        />
        {error !== '' && (
        <Text style={styles.error}>{error}</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={this.onPressButton}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        {success && (
        <Text style={styles.success}>Registration Successful, you may now login</Text>
        )}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.createAccountText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
