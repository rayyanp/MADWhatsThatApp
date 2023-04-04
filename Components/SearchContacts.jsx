/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, SectionList, TouchableOpacity, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

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
    flexDirection: 'row',
  },
  individualContact: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 12,
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  newChatInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  startChatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ccc',
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
      photos: {},
      visibleModal: null,
      newChatName: '',
      selectedContact: null,
    };
  }

  searchContacts = async () => {
    const {
      query, searchIn, limit, offset,
    } = this.state;

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/search?q=${query}&search_in=${searchIn}&limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          Accept: 'application/json',
        },
      });

      if (response.status === 200) { /* empty */ } else if (response.status === 400) {
        throw new Error('Bad Request');
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      }

      const data = await response.json();
      const contacts = data.map((contact) => ({
        id: contact.user_id.toString(),
      }));
        // Call get_profile_image for each contact
        // eslint-disable-next-line no-restricted-syntax
      for (const contact of contacts) {
        // eslint-disable-next-line no-await-in-loop
        await this.get_profile_image(contact.id);
      }
      if (data.length === 0) {
        this.setState({ error: 'No results' });
      } else {
        this.setState({ users: data, error: '' });
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
      .catch((error) => {
        this.setState({ error: error.message });
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
    const { newChatName } = this.state;
    try {
      // Create a new chat
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChatName,
        }),
      });

      if (response.status === 201) {
        const chat = await response.json();
        const chatId = chat.chat_id;

        // Add the selected contact to the chat
        await this.addContactToChat(userId, chatId);
        this.setState({ newChatName: '' });
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
      this.setState({ error: error.message });
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
      this.setState({ error: error.message });
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

  renderItem = ({ item }) => {
    const { photos } = this.state;
    return (
      <View style={styles.item}>
        <View style={styles.userInfo}>
          <View style={styles.photoContainer}>
            {photos[item.user_id] ? (
              <Image source={{ uri: photos[item.user_id] }} style={styles.photo} />
            ) : (
              <Text style={styles.noPhotoText}>No photo</Text>
            )}
          </View>
          <View style={styles.individualContact}>
            <Text style={styles.name}>{`${item.given_name} ${item.family_name}`}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.startChatButton}
          onPress={() => this.setState({ visibleModal: true, selectedContact: item })}
        >
          <Icon name="chat" style={styles.icon} />
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
  };

  // eslint-disable-next-line class-methods-use-this
  renderButton = (onPress) => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  renderModalContent = (selectedContact) => (
    <View style={styles.modalContent}>
      <TextInput
        style={styles.newChatInput}
        onChangeText={(text) => this.setState({ newChatName: text })}
        // eslint-disable-next-line react/destructuring-assignment
        value={this.state.newChatName}
        placeholder="Enter new chat name"
      />
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => {
          this.setState({ visibleModal: null });
          this.startChat(selectedContact.user_id);
        }}
      >
        <Text>Start Chat</Text>
      </TouchableOpacity>
      {this.renderButton(() => this.setState({ visibleModal: null }))}
    </View>
  );

  renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );

  render() {
    const {
      users, error, offset, limit, selectedContact, visibleModal,
    } = this.state;

    const sections = [{ title: 'Contacts', data: users }];

    return (
      <View style={styles.container}>
        <Modal
          isVisible={visibleModal !== null}
          onBackdropPress={() => this.setState({ visibleModal: null })}
        >
          {selectedContact ? (
            this.renderModalContent(selectedContact)
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>No contact selected.</Text>
            </View>
          )}
        </Modal>
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
            <TouchableOpacity
              onPress={() => this.setState({ error: '' })}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={24} color="black" />
            </TouchableOpacity>
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
