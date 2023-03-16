import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class ChatInfoScreen extends Component {
  state = {
    chatName: '',
    members: [],
    error: null,
    members: [],
    isLoading: true,
    contacts: [],
  };

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
    const chatId = this.props.route.params.chatId;
    this.fetchChatData(chatId);
    this.fetchContactsData();
  });
  }
  fetchChatData = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/`+chatId, {
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          Accept: 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        this.setState({
          chatName: data.name,
          members: data.members,
          isLoading: false,
          error: null,
        });
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
      this.setState({ error: error.message, isLoading: false });
    }
  };

  fetchContactsData = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/contacts', {
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          Accept: 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        const contacts = data.map((contact) => ({
          id: contact.user_id.toString(),
          name: `${contact.first_name} ${contact.last_name}`,
        }));
        this.setState({ contacts, error: null });
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else {
        throw new Error('Server Error');
      }
    } catch (error) {
      console.error(error);
      this.setState({ error: error.message });
    }
    };


  removeMember = async (userId) => {
    const chatId = this.props.route.params.chatId;
  
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/`+chatId+`/user/`+userId, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        this.fetchChatData(chatId); // call fetchChatData after deleting the user from the chat
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
      this.setState({ error: error.message });
    }
  };

  addContactToChat = async (userId) => {
    const chatId = this.props.route.params.chatId;
  
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/`+chatId+`/user/`+userId, {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        await this.fetchChatData(chatId); // call fetchChatData after adding the user to the chat
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
  const { members, error, chatName, contacts, isLoading } = this.state;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!members) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.chatName}>{chatName}</Text>
      </View>  
      <FlatList
          data={members}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.memberContainer}>
              <Text style={styles.memberNameText}>
                {item.first_name} {item.last_name}
              </Text>
              <TouchableOpacity
                style={styles.removeMemberButton}
                onPress={() => this.removeMember(item.user_id)}
              >
                <Icon name="minus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
        <View style={styles.addMemberContainer}>
        <Text style={styles.addMemberTitle}>Add Members</Text>
  
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactContainer}>
              <Text style={styles.contactNameText}>{item.name}</Text>
              <TouchableOpacity 
                style={styles.addMemberButton}
                onPress={() => this.addContactToChat(item.id)}
              >
                <Icon name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'red',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#075e54',
  },
  chatName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  membersContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberNameText: {
    flex: 1,fontSize: 16,
  },
  removeMemberButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  addMemberContainer: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addMemberTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactNameText: {
    flex: 1,
    fontSize: 16,
  },
  addMemberButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});   
      