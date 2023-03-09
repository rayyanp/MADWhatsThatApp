import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        'Accept': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          const { contacts } = this.state;
          const updatedContacts = contacts.filter((c) => c.id !== id);
          this.setState({ contacts: updatedContacts, error: null });
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

  renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactContainer}
    >
      <Text style={styles.contactName}>{item.name}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => this.removeContact(item)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.blockButton}
          onPress={() => this.blockUser(item)}
        >
          <Text style={styles.buttonText}>Block</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
  buttonContainer: {
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  blockButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
});