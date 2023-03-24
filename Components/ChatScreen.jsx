/* eslint-disable no-dupe-keys */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable radix */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList,
} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import Icon from 'react-native-vector-icons/MaterialIcons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

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
  chatContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 10,
  },
  messageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
    marginLeft: 5,
  },
  messageOptionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  editMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  editMessageInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D3D3D3',
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonIcon: {
    marginLeft: 2,
  },
  errorContainer: {
    backgroundColor: 'red',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  errorText: {
    color: '#fff',
    marginLeft: 10,
  },
  chatNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C7E56',
    paddingHorizontal: 10,
    height: 50,
  },
  chatNameWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chatInfoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    height: '100%',
  },
  successContainer: {
    backgroundColor: '#eaffea',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    position: 'relative',
  },
  successText: {
    color: '#008000',
    fontSize: 16,
    marginLeft: 10,
  },
  messageContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
    padding: 8,
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000',
  },
  messageInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#808080',
    marginRight: 5,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#808080',
    marginRight: 5,
  },
  messageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: 5,
  },
  messageOptionButton: {
    padding: 5,
  },
});

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatData: null,
      error: null,
      isLoading: true,
      textMessage: '',
      editMessageId: null,
      editTextMessage: '',
      isEditing: false,
      showSuccess: false,
      userId: null,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;

    navigation.addListener('focus', async () => {
      await this.fetchChatData();
      await this.fetchUserProfile();
    });
  }

  fetchUserProfile = async () => {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    this.setState({ userId });
  };

  fetchChatData = async () => {
    const { chatId } = this.props.route.params;

    try {
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/chat/${chatId}?limit=20&offset=0`,
        {
          headers: {
            'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
            Accept: 'application/json',
          },
        },
      );

      if (response.status === 200) {
        const data = await response.json();
        this.setState({ chatData: data, isLoading: false });
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
      console.error('Error fetching chat data:', error);
      this.setState({ error, isLoading: false });
    }
  };

  sendMessage = async () => {
    const { chatId } = this.props.route.params;
    const { textMessage } = this.state;

    if (textMessage.trim().length === 0) {
      this.setState({ error: 'Please enter a message before pressing send' });
      return;
    }

    if (textMessage.length > 1000) {
      this.setState({ error: 'The message is too long' });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/chat/${chatId}/message`,
        {
          method: 'POST',
          headers: {
            'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: textMessage }),
        },
      );

      if (response.status === 200) {
        this.setState({ textMessage: '' }); // Clear the message input field
        this.fetchChatData(); // Fetch chat data again to display the new message
        // eslint-disable-next-line consistent-return
        return response;
      } if (response.status === 400) {
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
      console.error('Error sending message:', error);
      this.setState({ error });
    }
  };

  editMessage = async () => {
    const { chatId } = this.props.route.params;
    const { editMessageId, editTextMessage } = this.state;
    this.setState({ isEditing: true });

    try {
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/chat/${chatId}/message/${editMessageId}`,
        {
          method: 'PATCH',
          headers: {
            'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: editTextMessage }),
        },
      );

      if (response.status === 200) {
        this.setState({
          editMessageId: null,
          editTextMessage: '',
          isEditing: false,
        });
        this.fetchChatData();
      } else if (response.status === 400) {
        throw new Error('Bad request');
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 403) {
        throw new Error('Forbidden, you cannot edit someone elses message');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Error');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      this.setState({ isEditing: false, error });
    }
  };

  deleteMessage = async (messageId) => {
    const { chatId } = this.props.route.params;

    try {
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/chat/${chatId}/message/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          },
        },
      );

      if (response.status === 200) {
        this.fetchChatData();
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 403) {
        throw new Error('Forbidden, you cannot delete someone elses message');
      } else if (response.status === 404) {
        throw new Error('Not Found');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Error');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      this.setState({ error });
    }
  };

  draftMessages = async () => {
    const { chatId } = this.props.route.params;
    const { textMessage } = this.state;

    if (textMessage.trim().length === 0) {
      this.setState({ error: 'Please enter a message before pressing draft' });
      return;
    }

    if (textMessage.length > 1000) {
      this.setState({ error: 'The message is too long' });
      return;
    }

    try {
      // Get the previously saved messages from local storage
      let savedMessages = await AsyncStorage.getItem(`draft_messages_${chatId}`);
      savedMessages = JSON.parse(savedMessages || '[]');

      // Add the message_id property to each message object
      savedMessages = savedMessages.map((message, index) => ({
        ...message,
        message_id: index + 1, // Generate a message ID starting from 1
      }));

      // Add the current message to the list of saved messages
      savedMessages.push({ message: textMessage, message_id: savedMessages.length + 1 });

      // Save the updated list of messages to local storage
      await AsyncStorage.setItem(`draft_messages_${chatId}`, JSON.stringify(savedMessages));

      // Clear the message text input
      this.setState({ textMessage: '', showSuccess: true });
    } catch (error) {
      console.error(error);
      this.setState({ error: 'Failed to save message. Please try again later.' });
    }
  };

  render() {
    const {
      chatData, textMessage, isLoading,
      isEditing, editMessageId, editTextMessage,
      error, showSuccess, userId,
    } = this.state;
    const { chatId } = this.props.route.params;
    const { navigation } = this.props;

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6646ee" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => this.setState({ error: null })}
          >
            <Ionicons name="close-circle" size={24} color="black" />
          </TouchableOpacity>
          {error.message && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.chatNameContainer}>
          <View style={styles.chatNameWrapper}>
            <Text style={styles.chatName}>{chatData.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.chatInfoButton}
            onPress={() => navigation.navigate('ChatInfo', { chatId })}
          >
            <Icon name="info" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatInfoButton}
            onPress={() => navigation.navigate('DraftMessages', { chatId })}
          >
            <Icon name="save" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        {showSuccess && (
        <View style={styles.successContainer}>
          <TouchableOpacity
            onPress={() => this.setState({ showSuccess: false })}
            style={styles.closeButton}
          >
            <Ionicons name="close-circle" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.successText}>Your message has been saved to drafts!</Text>
        </View>
        )}
        <View style={styles.chatContainer}>
          <FlatList
            // eslint-disable-next-line no-return-assign
            ref={(ref) => (this.flatListRef = ref)}
            data={chatData.messages}
            inverted
            keyExtractor={(item) => item.message_id}
            renderItem={({ item: message }) => (
              <View style={[styles.messageContainer,
                message.author.user_id
                === parseInt(userId)
                  ? styles.myMessageContainer : styles.otherMessageContainer]}
              >
                {message.author && (
                <Text style={styles.messageSender}>
                  {message.author.first_name}
                  {' '}
                  {message.author.last_name}
                </Text>
                )}
                <Text style={styles.messageText}>{message.message}</Text>
                <View style={styles.messageInfoContainer}>
                  <Text style={styles.messageTimestamp}>
                    {moment(message.timestamp).format(
                      moment(message.timestamp).isSame(new Date(), 'day') ? 'LT' : 'll',
                    )}
                  </Text>
                  {message.author.user_id === parseInt(userId) && (
                  <View style={styles.messageOptionsContainer}>
                    <TouchableOpacity
                      style={styles.messageOptionButton}
                      onPress={() => this.setState({
                        editMessageId: message.message_id,
                        editTextMessage: message.message,
                      })}
                    >
                      <Icon name="edit" size={24} color="#075e54" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.deleteMessage(message.message_id)}>
                      <Icon name="delete" size={24} color="#075e54" />
                    </TouchableOpacity>
                  </View>
                  )}
                </View>
                {editMessageId === message.message_id ? (
                  <View style={styles.editMessageContainer}>
                    <TextInput
                      style={styles.editMessageInput}
                      onChangeText={(text) => this.setState({ editTextMessage: text })}
                      value={editTextMessage}
                    />
                    <TouchableOpacity
                      style={styles.editMessageButton}
                      onPress={() => {
                        this.editMessage();
                      }}
                    >
                      {isEditing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Icon name="save" size={24} color="green" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editMessageButton}
                      onPress={() => {
                        this.setState({ editMessageId: null, editTextMessage: '' });
                      }}
                      disabled={isEditing}
                    >
                      <Icon name="close" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                  </>
                )}
              </View>
            )}
            onLayout={() => this.flatListRef.scrollToEnd({ animated: true })}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => this.setState({ textMessage: text })}
            value={textMessage}
            placeholder="Type your message here..."
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              this.sendMessage();
            }}
            disabled={!textMessage.trim()}
          >
            <Icon name="send" size={24} color="#fff" style={styles.sendButtonIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={this.draftMessages}
            disabled={!textMessage.trim()}
          >
            <Icon name="save" size={24} color="#fff" style={styles.sendButtonIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
