import React, { Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SectionList, Image, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  headerContainer: {
    backgroundColor: '#2980b9',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  viewBlockedButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: '#4C4C4C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  viewBlockedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
  },
  sectionHeader: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  individualContact: {
    flex: 1,
    marginLeft: 10,
  },
  contactName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  email: {
    fontSize: 12,
    color: '#666',
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: 50,
    height: 50,
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
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 14,
    color: 'white',
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

export default class Contacts extends Component {
  static navigationOptions = {
    title: 'Contacts',
  };

  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      photos: {}, // map of contact IDs to photo URLs
      error: null,
      visibleModal: null,
      newChatName: '',
      selectedContact: null,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;

    this.unsubscribe = navigation.addListener('focus', async () => {
      await this.getContacts();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getContacts = async () => {
    fetch('http://localhost:3333/api/1.0.0/contacts', {
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 500) {
          throw new Error('Server Error');
        } else {
          throw new Error('Not Found');
        }
      })
      .then(async (data) => {
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
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
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
          this.getContacts(); // call getContacts() to update the list of contacts
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
          this.getContacts(); // Call getContacts to update the contact list
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

  renderModalContent = (selectedContact) => {
    const { newChatName } = this.state;

    return (
      <View style={styles.modalContent}>
        <TextInput
          style={styles.newChatInput}
          onChangeText={(text) => this.setState({ newChatName: text })}
          value={newChatName}
          placeholder="Enter new chat name"
        />
        <TouchableOpacity
          style={styles.startChatButton}
          onPress={() => {
            this.setState({ visibleModal: null });
            this.startChat(selectedContact.id);
          }}
        >
          <Text>Start Chat</Text>
        </TouchableOpacity>
        {this.renderButton(() => this.setState({ visibleModal: null }))}
      </View>
    );
  };

  render() {
    const {
      contacts, error, photos, visibleModal, selectedContact,
    } = this.state;
    const { navigation } = this.props;

    // eslint-disable-next-line no-shadow
    function orderContacts(contacts) {
      const order = {};

      // group the contacts by their first letter of the name
      contacts.forEach((contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!order[firstLetter]) {
          order[firstLetter] = [];
        }
        order[firstLetter].push(contact);
      });

      // convert the groups object to an array of sections
      const sections = Object.keys(order).sort().map((letter) => ({
        title: letter,
        data: order[letter],
      }));

      return sections;
    }

    const orderedContacts = orderContacts(contacts);

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
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Contacts</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.viewBlockedButton}
              onPress={() => navigation.navigate('Blocked')}
            >
              <Text style={styles.viewBlockedText}>Blocked</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate('SearchContacts')}
            >
              <Icon name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <SectionList
            sections={orderedContacts}
            renderItem={({ item }) => (
              <View style={styles.contactContainer}>
                <View style={styles.photoContainer}>
                  {photos[item.id] ? (
                    <Image source={{ uri: photos[item.id] }} style={styles.photo} />
                  ) : (
                    <Text style={styles.noPhotoText}>No photo</Text>
                  )}
                </View>
                <View style={styles.individualContact}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.startChatButton}
                    onPress={() => this.setState({ visibleModal: true, selectedContact: item })}
                  >
                    <Icon name="chat" style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => this.removeContact(item)}
                  >
                    <Icon name="delete" style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.blockButton}
                    onPress={() => this.blockUser(item)}
                  >
                    <Text style={styles.buttonText}>Block</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
    );
  }
}
