/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// eslint-disable-next-line import/no-unresolved
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  formSubheading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 20,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
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
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 10,
  },
  icon: {
    marginHorizontal: 5,
  },
  messageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  messageOptionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  messageOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
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
});

export default class DraftMessages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatData: [],
      isLoading: true,
      error: null,
      isEditing: false,
      editMessageId: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    navigation.addListener('focus', () => {
      this.fetchDraftsData();
    });
  }

  fetchDraftsData = async () => {
    const { chatId } = this.props.route.params;
    try {
      const savedMessages = await AsyncStorage.getItem(`draft_messages_${chatId}`);
      this.setState({ chatData: JSON.parse(savedMessages) || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching draft messages:', error);
      this.setState({ isLoading: false, error });
    }
  };

  deleteDraftMessage = async (message_id) => {
    const { chatId } = this.props.route.params;
    try {
      // retrieve the list of draft messages from local storage
      const draftMessages = await AsyncStorage.getItem(`draft_messages_${chatId}`);
      const parsed = JSON.parse(draftMessages);

      // filter out the message with the specified message_id
      const filteredMessages = parsed.filter((message) => message.message_id !== message_id);

      // store the updated list of draft messages back in local storage
      await AsyncStorage.setItem(`draft_messages_${chatId}`, JSON.stringify(filteredMessages));

      // update the state to reflect the deleted message
      this.fetchDraftsData();
    } catch (error) {
      console.error('Error deleting message:', error);
      this.setState({ error });
    }
  };

  // eslint-disable-next-line consistent-return
  sendDraftMessage = async (message_id) => {
    const { chatId } = this.props.route.params;

    // Get the draft messages from local storage
    const draftMessages = await AsyncStorage.getItem(`draft_messages_${chatId}`);
    const parsedDraftMessages = JSON.parse(draftMessages);

    // Find the draft message with the matching message ID
    const draftMessage = parsedDraftMessages.find((message) => message.message_id === message_id);

    // If a draft message was found, use it as the message body for the API call
    if (draftMessage) {
      try {
        const response = await fetch(
          `http://localhost:3333/api/1.0.0/chat/${chatId}/message`,
          {
            method: 'POST',
            headers: {
              'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: draftMessage.message }),
          },
        );

        if (response.status === 200) {
          await this.deleteDraftMessage(draftMessage.message_id);
          this.fetchDraftsData();
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
    }
  };

  editDraftMessage = async (message_id) => {
    const { chatId } = this.props.route.params;
    const { editTextMessage } = this.state;
    this.setState({ isEditing: true });

    try {
      // retrieve the list of draft messages from local storage
      const draftMessages = await AsyncStorage.getItem(`draft_messages_${chatId}`);
      const parsed = JSON.parse(draftMessages);

      const editedDraftMessages = parsed.map((draftMessage) => {
        if (draftMessage.message_id === message_id) {
          return { ...draftMessage, message: editTextMessage };
        }
        return draftMessage;
      });

      // update the list of draft messages in local storage
      await AsyncStorage.setItem(`draft_messages_${chatId}`, JSON.stringify(editedDraftMessages));

      // reset the state and refetch the data
      this.setState({
        editMessageId: null,
        editTextMessage: '',
        isEditing: false,
      });
      this.fetchDraftsData();
    } catch (error) {
      console.error('Error editing message:', error);
      this.setState({ isEditing: false, error });
    }
  };

  render() {
    const {
      chatData, isLoading, error, isEditing, editMessageId, editTextMessage,
    } = this.state;

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
            <Icon name="close-circle" size={24} color="black" />
          </TouchableOpacity>
          {error.message && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.formSubheading}>Draft Messages</Text>
        <ScrollView>
          {chatData.map((message) => (
            <View style={styles.message} key={message.message_id}>
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
                      this.editDraftMessage(message.message_id);
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
                  <Text style={styles.messageText}>{message.message}</Text>
                  <View style={styles.messageOptionsContainer}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => this.setState({
                        editMessageId: message.message_id,
                        editTextMessage: message.message,
                      })}
                    >
                      <Icon name="edit" size={20} color="#2089dc" style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => this.sendDraftMessage(message.message_id)}
                    >
                      <Icon name="send" size={20} color="#28a745" style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => this.deleteDraftMessage(message.message_id)}
                    >
                      <Icon name="delete" size={20} color="#dc3545" style={styles.icon} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}
