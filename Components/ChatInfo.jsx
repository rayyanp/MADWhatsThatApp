/* eslint-disable radix */
import React, { Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Image,
} from 'react-native';
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
  individualMember: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  chatNameWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  iconButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: 35,
    marginRight: 5,
    marginLeft: 5,
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
      photos: {},
      userPhoto: null,
      userId: null,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;

    this.unsubscribe = navigation.addListener('focus', async () => {
      const { route: { params: { chatId } } } = this.props;
      await this.fetchChatData(chatId);
      await this.fetchContactsData();
      await this.get_user_image();
      await this.fetchUserProfile();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  fetchUserProfile = async () => {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    this.setState({ userId });
  };

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

        // Calls get_profile_image for each contact
        // eslint-disable-next-line no-restricted-syntax
        for (const contact of contacts) {
          // eslint-disable-next-line no-await-in-loop
          await this.get_profile_image(contact.id);
        }
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

  get_user_image = async () => {
    try {
      const userId = await AsyncStorage.getItem('whatsthat_user_id');
      const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
        method: 'GET',
        headers: {
          'X-Authorization': sessionToken,
        },
      });
      const blob = await response.blob();
      const data = URL.createObjectURL(blob);

      this.setState({
        userPhoto: data,
      });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  removeMember = async (userId) => {
    const { route: { params: { chatId } } } = this.props;

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        this.fetchChatData(chatId); // calls fetchChatData after deleting the user from the chat
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

  leaveChat = async (userId) => {
    const { route: { params: { chatId } } } = this.props;
    const { navigation } = this.props;

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        navigation.navigate('ChatListScreen');
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
    const { route: { params: { chatId } } } = this.props;

    try {
      const response = await fetch(`http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`, {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        await this.fetchChatData(chatId);
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
    const { route: { params: { chatId } } } = this.props;
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
        // Clears editChatName input field and resets editChatId and editChatName to null
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
      photos, userPhoto, userId,
    } = this.state;
    const { route: { params: { chatId } } } = this.props;
    const { navigation } = this.props;

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
              <View style={styles.chatNameWrapper}>
                <Text style={styles.chatName}>{chatName}</Text>
              </View>
              <TouchableOpacity
                style={styles.editChatNameButton}
                onPress={() => this.setState({
                  isEditingChatName: true,
                  editChatId: chatId,
                  editChatName: chatName,
                })}
              >
                <Icon name="pencil" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AddContactChat', { chatId })}>
                <Icon name="account-multiple-plus" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => this.leaveChat(userId)}
              >
                <Icon name="logout" size={24} color="red" />
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
                <View style={styles.photoContainer}>
                  {photos[item.user_id] ? (
                    <Image source={{ uri: photos[item.user_id] }} style={styles.photo} />
                  ) : (
                    userPhoto && <Image source={{ uri: userPhoto }} style={styles.photo} />
                  )}
                  {!photos[item.user_id] && !userPhoto && (
                  <Text style={styles.noPhotoText}>No photo</Text>
                  )}
                </View>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.memberNameText}>
                    {item.first_name}
                    {' '}
                    {item.last_name}
                  </Text>
                </View>
                {item.user_id !== parseInt(userId) && (
                <TouchableOpacity
                  style={styles.removeMemberButton}
                  onPress={() => this.removeMember(item.user_id)}
                >
                  <Icon name="minus" size={20} color="#fff" />
                </TouchableOpacity>
                )}
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
                <View style={styles.photoContainer}>
                  {photos[item.id] ? (
                    <Image source={{ uri: photos[item.id] }} style={styles.photo} />
                  ) : (
                    <Text style={styles.noPhotoText}>No photo</Text>
                  )}
                </View>
                <View style={styles.individualMember}>
                  <Text style={styles.contactNameText}>{item.name}</Text>
                </View>
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
