import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Contacts extends Component {
  static navigationOptions = {
    title: 'Blocked',
  };

  state = {
    contacts: [],
    error: null,
  };

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.getBlockedContacts();
    });
  }
  
  getBlockedContacts = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/blocked', {
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          'Accept': 'application/json',
        },
      });
  
      if (response.status === 200) {
        const data = await response.json();
  
        if (Array.isArray(data)) {
          const contacts = data.map((contact) => ({
            id: contact.user_id.toString(),
            name: `${contact.first_name} ${contact.last_name}`,
          }));
  
          this.setState({ contacts, error: null });
        } else {
          throw new Error('Data is not an array');
        }
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Not Found');
      }
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  renderItem = ({ item }) => (
    <View
      style={styles.contactContainer}
    >
      <Text style={styles.contactName}>{item.name}</Text>
    </View>
  );

  render() {
    const { contacts, error } = this.state;
  
    return (
      <View style={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={contacts}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  error: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});