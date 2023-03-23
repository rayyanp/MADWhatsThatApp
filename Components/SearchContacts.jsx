/* eslint-disable react/prop-types */
/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, SectionList, TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// eslint-disable-next-line import/no-unresolved
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5FCFF',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 10,
    fontWeight: 'bold',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  addContactButton: {
    marginLeft: 10,
  },
  sectionHeader: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffeaea',
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  startChatButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  blockButton: {
    backgroundColor: '#4C4C4C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  icon: {
    fontSize: 14,
    color: 'white',
  },
});

export default class SearchContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      searchIn: 'contacts',
      limit: 20,
      offset: 0,
      users: [],
      error: '',
    };
  }

  searchContacts = async () => {
    const {
      query, searchIn, limit, offset,
    } = this.state;

    fetch(`http://localhost:3333/api/1.0.0/search?q=${query}&search_in=${searchIn}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('OK');
        } else if (response.status === 400) {
          console.error('Bad Request');
        } else if (response.status === 401) {
          console.error('Unauthorized');
        } else if (response.status === 500) {
          console.error('Server Error');
        }
        return response.json();
      })
      .then((data) => {
        if (data.length === 0) {
          this.setState({ error: 'No results' });
        } else {
          this.setState({ users: data, error: '' });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  removeContact = async (contact) => {
    const { id } = contact;
    fetch(`http://localhost:3333/api/1.0.0/user/${id}/contact`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.searchContacts(); // call getContacts() to update the list of contacts
        } else if (response.status === 400) {
          throw new Error("You can't remove yourself as a contact");
        } else if (response.status === 401) {
          throw new Error('Unauthorized');
        } else if (response.status === 404) {
          throw new Error('Not Found');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        } else {
          throw new Error('Error');
        }
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  };

  blockUser = async (contact) => {
    const { id } = contact;
    fetch(`http://localhost:3333/api/1.0.0/user/${id}/block`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          this.searchContacts(); // Call getContacts to update the contact list
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
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  };

  startChat = async (userId) => {
    const { navigation } = this.props;
    try {
      // Create a new chat
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Chat',
        }),
      });

      if (response.status === 201) {
        const chat = await response.json();
        const chatId = chat.chat_id;

        // Add the selected contact to the chat
        await this.addContactToChat(userId, chatId);

        // Redirect the user to the new chat
        navigation.navigate('ChatScreen', { chatId });
      } else if (response.status === 400) {
        throw new Error('Bad request');
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  addContactToChat = async (userId, chatId) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) { /* empty */ } else if (response.status === 400) {
        throw new Error('Bad Request');
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  nextPage = async () => {
    const {
      limit, offset,
    } = this.state;
    const newOffset = offset + limit;
    await this.setState({ offset: newOffset });
    this.searchContacts();
  };

  previousPage = async () => {
    const {
      limit, offset,
    } = this.state;
    const newOffset = offset - limit;
    await this.setState({ offset: newOffset < 0 ? 0 : newOffset });
    this.searchContacts();
  };

  renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{`${item.given_name} ${item.family_name}`}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => this.startChat(item.user_id)}
      >
        <Icon
          name="chat"
          style={styles.icon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => this.removeContact({ id: item.user_id })}
      >
        <Icon name="delete" style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.blockButton}
        onPress={() => this.blockUser({ id: item.user_id })}
      >
        <Text style={styles.buttonText}>Block</Text>
      </TouchableOpacity>
    </View>
  );

  renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );

  render() {
    const {
      users, error, offset, limit,
    } = this.state;

    const sections = [{ title: 'Contacts', data: users }];

    return (
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TextInput
            placeholder="Search contacts by first name, last name or email."
            placeholderTextColor="#C4C4C4"
            style={styles.searchInput}
            onChangeText={(query) => this.setState({ query })}
          />
          <Icon name="search" size={20} color="#fff" onPress={this.searchContacts} style={styles.searchButton} />
        </View>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView>
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.user_id}
              renderItem={this.renderItem}
              renderSectionHeader={this.renderSectionHeader}
            />
            <View style={styles.paginationContainer}>
              <View style={styles.buttonContainer}>
                <Button title="Previous Page" onPress={this.previousPage} disabled={offset === 0} />
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Next Page" onPress={this.nextPage} disabled={users.length < limit} />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}
