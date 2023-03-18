import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SectionList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class Contacts extends Component {
  static navigationOptions = {
    title: 'Contacts',
  };

  state = {
    contacts: [],
    photos: {}, // map of contact IDs to photo URLs
    error: null,
  };

  async componentDidMount() {
    this.props.navigation.addListener('focus', () => {
      this.getContacts();
    });
  }

  getContacts = async () => {
    fetch('http://localhost:3333/api/1.0.0/contacts', {
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Accept': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
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
        }));

        // Call get_profile_image for each contact
        for (const contact of contacts) {
          await this.get_profile_image(contact.id);
        }

        this.setState({ contacts, error: null });
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }

  get_profile_image = async (contactId) => {
    const session_token = await AsyncStorage.getItem('whatsthat_session_token');
    fetch(`http://localhost:3333/api/1.0.0/user/`+contactId+`/photo`, {
        method: "GET",
        headers: {
          'X-Authorization': session_token,
        }
    })
    .then((res) => {
        if(res.status === 200){
          return res.blob()
        }
        else if(res.status === 401){
          throw new Error("Unauthorized")
        }
        else if(res.status === 404){
          throw new Error("Not Found")
        }
        else{
          throw new Error("Server Error")
        }
    })
    .then((resBlob) => {
        let data = URL.createObjectURL(resBlob);
        this.setState(prevState => ({
            photos: {
                ...prevState.photos,
                [contactId]: data,
            },
        }))
    })
    .catch((err) => {
        console.log(err)
    })
  }
      
  removeContact = async (contact) => {
    const { id } = contact;
    fetch(`http://localhost:3333/api/1.0.0/user/`+id+`/contact`, {
      method: 'DELETE',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
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
  }

  blockUser = async (contact) => {
    const { id } = contact;
    fetch(`http://localhost:3333/api/1.0.0/user/`+id+`/block`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
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
    try {
      // Create a new chat
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
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
        this.props.navigation.navigate('ChatScreen', { chatId });
      } else if (response.status === 400) {
        throw new Error("Bad request");
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
  
  addContactToChat = async (userId, chatId) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/`+chatId+`/user/`+userId, {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          'Content-Type': 'application/json',
        },
      });
    
      if (response.status === 200) {
      } else if (response.status === 400) {
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
  


render() {
  const { contacts, error, photos } = this.state;

  function orderContacts(contacts) {
    const order = {};

    // group the contacts by their first letter of the name
    contacts.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!order[firstLetter]) {
        order[firstLetter] = [];
      }
      order[firstLetter].push(contact);
    });

    // convert the groups object to an array of sections
    const sections = Object.keys(order).sort().map(letter => ({
      title: letter,
      data: order[letter],
    }));

    return sections;
  }

  const orderedContacts = orderContacts(contacts);

  return (
    <View style={styles.container}>
    <View style={styles.headerContainer}>
      <Text style={styles.header}>Contacts</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.viewBlockedButton}
          onPress={() => this.props.navigation.navigate('Blocked')}
        >
          <Text style={styles.viewBlockedText}>Blocked</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => this.props.navigation.navigate('SearchContacts')}
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
              <Text style={styles.contactName}>{item.name}</Text>
              <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.startChatButton}
                onPress={() => this.startChat(item.id)}
              >
                <Icon
                  name="chat"
                  style={styles.icon}
                />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  headerContainer: {
    backgroundColor:'#2980b9',
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
    flexDirection: 'row',
    alignItems: 'center',
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
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
