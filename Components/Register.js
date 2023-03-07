import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import * as EmailValidator from 'email-validator';

export default class RegisterScreen extends Component {
  constructor(props) {
  super(props);
  this.state = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    error: '',
    submitted: false,
};
this._onPressButton = this._onPressButton.bind(this);
}

_onPressButton() {
  this.setState({ submitted: true });
  this.setState({ error: '' });
  if (
    !(
      this.state.first_name &&
      this.state.last_name &&
      this.state.email &&
      this.state.password
    )
  ) {
    this.setState({
      error: 'Must enter first name, last name, email and password',
    });
    return;
  }

  if (!EmailValidator.validate(this.state.email)) {
    this.setState({ error: 'Must enter valid email' });
    return;
  }

  const PASSWORD_REGEX = new RegExp(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
  );
  if (!PASSWORD_REGEX.test(this.state.password)) {
    this.setState({
      error:
        "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
    });
    return;
  }

  fetch('http://localhost:3333/api/1.0.0/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
      password: this.state.password,
    }),
  })
    .then((response) => {
      if (response.status === 201) {
        this.setState({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          submitted: false,
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        onChangeText={(text) => this.setState({ first_name: text })}
        value={this.state.first_name}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        onChangeText={(text) => this.setState({ last_name: text })}
        value={this.state.last_name}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        onChangeText={(text) => this.setState({ email: text })}
        value={this.state.email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={(text) => this.setState({ password: text })}
        value={this.state.password}
      />
      {this.state.error !== '' && (
        <Text style={styles.error}>{this.state.error}</Text>
      )}
        <TouchableOpacity
          style={styles.button}
          onPress={this._onPressButton}
          >
          <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          {this.state.success && (
        <Text style={styles.success}>Registration Successful, you may now login</Text>
      )}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => this.props.navigation.navigate('Login')}
        >
          <Text style={styles.createAccountText}>Login</Text>
        </TouchableOpacity>
    </View>
    );
  }
}