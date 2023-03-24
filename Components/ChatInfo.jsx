/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator,
} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  chatInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2C7E56',
  },
  chatName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  editChatNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editChatNameButton: {
    backgroundColor: '#007aff',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  editChatNameInput: {
    flex: 1,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  saveChatNameButton: {
    backgroundColor: '#007aff',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  saveChatNameButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelEditChatNameButton: {
    marginLeft: 10,
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
    flex: 1, fontSize: 16,
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
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chatCreatorText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2C7E56',
    marginRight: 8,
  },

});

export default class ChatInfoScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatName: '',
      chatCreator: '',
      members: [],
      error: null,
      isLoading: true,
      contacts: [],
      editChatId: null,
      editChatName: '',
      isEditingChatName: false,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;

    navigation.addListener('focus', async () => {
      const { chatId } = this.props.route.params;
      await this.fetchChatData(chatId);
      await this.fetchContactsData();
    });
  }

  fetchChatData = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}`, {
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          Accept: 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        this.setState({
          chatName: data.name,
          chatCreator: data.creator,
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
      this.setState({ error: error.message, isLoading: false });
    }
  };

  fetchContactsData = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/contacts', {
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
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
      this.setState({ error: error.message });
    }
  };

  removeMember = async (userId) => {
    const { chatId } = this.props.route.params;

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
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
      this.setState({ error: error.message });
    }
  };

  addContactToChat = async (userId) => {
    const { chatId } = this.props.route.params;

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
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
      this.setState({ error: error.message });
    }
  };

  editChatName = async () => {
    const { chatId } = this.props.route.params;
    const { editChatId, editChatName } = this.state;
    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${editChatId}`, {
        method: 'PATCH',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editChatName,
        }),
      });
      if (response.status === 200) {
        // Clear the edit chat name input field and reset editChatId and editChatName to null
        this.setState({
          editChatId: null,
          editChatName: '',
          isEditingChatName: false, // disable editing mode
        });
        // Refresh the chat list
        this.fetchChatData(chatId);
      } else if (response.status === 400) {
        throw new Error('Bad request');
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 403) {
        throw new Error('Forbidden');
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

  editChatNameChange = (editChatName) => {
    this.setState({ editChatName });
  };

  render() {
    const {
      members, error, chatName, contacts, isLoading, editChatName, isEditingChatName, chatCreator,
    } = this.state;

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
          {isEditingChatName ? (
            <View style={styles.editChatNameContainer}>
              <TextInput
                style={styles.editChatNameInput}
                onChangeText={this.editChatNameChange}
                value={editChatName}
              />
              <TouchableOpacity
                style={styles.saveChatNameButton}
                onPress={this.editChatName}
              >
                <Text style={styles.saveChatNameButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelEditChatNameButton}
                onPress={() => this.setState({ isEditingChatName: false })}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.chatName}>{chatName}</Text>
              <TouchableOpacity
                style={styles.editChatNameButton}
                onPress={() => this.setState({
                  isEditingChatName: true,
                  editChatId: this.props.route.params.chatId,
                  editChatName: chatName,
                })}
              >
                <Icon name="pencil" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.creatorContainer}>
          <Text style={styles.chatCreatorText}>Chat Creator:</Text>
          <Text>
            {chatCreator.first_name}
            {' '}
            {chatCreator.last_name}
          </Text>
        </View>
        <View style={styles.membersContainer}>
          <Text style={styles.membersTitle}>Members</Text>

          <FlatList
            data={members}
            keyExtractor={(item) => item.user_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.memberContainer}>
                <Text style={styles.memberNameText}>
                  {item.first_name}
                  {' '}
                  {item.last_name}
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
        </View>

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
