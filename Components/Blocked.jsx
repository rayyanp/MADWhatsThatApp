/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  email: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  error: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noPhotoText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default class BlockedContacts extends Component {
  static navigationOptions = {
    title: 'Blocked',
  };

  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      error: null,
      photos: {},
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;

    navigation.addListener('focus', async () => {
      await this.getBlockedContacts();
    });
  }

  getBlockedContacts = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/blocked', {
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          Accept: 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();

        if (Array.isArray(data)) {
          const contacts = data.map((contact) => ({
            id: contact.user_id.toString(),
            name: `${contact.first_name} ${contact.last_name}`,
            email: contact.email,
          }));
          // Call get_profile_image for each contact
          // eslint-disable-next-line no-restricted-syntax
          for (const contact of contacts) {
          // eslint-disable-next-line no-await-in-loop
            await this.get_profile_image(contact.id);
          }
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
  };

  unblockContact = async (contact) => {
    const { id } = contact;
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${id}/block`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        this.getBlockedContacts();
      } else if (response.status === 400) {
        throw new Error("You can't block yourself as a contact");
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
      this.setState({ error: error.message });
    }
  };

  get_profile_image = async (contactId) => {
    const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
    fetch(`http://localhost:3333/api/1.0.0/user/${contactId}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': sessionToken,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        }
        if (res.status === 401) {
          throw new Error('Unauthorized');
        } else if (res.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Server Error');
        }
      })
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);
        this.setState((prevState) => ({
          photos: {
            ...prevState.photos,
            [contactId]: data,
          },
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  renderItem = ({ item }) => {
    const { photos } = this.state;
    return (
      <View style={styles.contactContainer}>
        <View style={styles.photoContainer}>
          {photos[item.id] ? (
            <Image source={{ uri: photos[item.id] }} style={styles.photo} />
          ) : (
            <Text style={styles.noPhotoText}>No photo</Text>
          )}
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => this.unblockContact(item)}
        >
          <Text style={styles.deleteButtonText}>Unblock</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
