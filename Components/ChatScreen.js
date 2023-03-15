import React, {Component} from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator,StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ChatScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      chatData: null ,
      error: null,
      isLoading: true,
      textMessage: '',
      editMessageId: null,
      editTextMessage: '',
      isEditing: false,
      isDeleting: false,
    };
  }

componentDidMount() {
  this.props.navigation.addListener('focus', () => {
  this.fetchChatData();
});
}

 fetchChatData = async () => {
  const { chatId } = this.props.route.params;

  try {
    const response = await fetch(
      `http://localhost:3333/api/1.0.0/chat/`+chatId+`?limit=20&offset=0`,
      {
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'
          ),
          Accept: 'application/json',
        },
      }
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

  try {
    const response = await fetch(
      `http://localhost:3333/api/1.0.0/chat/`+chatId+`/message`,
      {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textMessage }),
      }
    );

    if (response.status === 200) {
      this.setState({ textMessage: '' }); // Clear the message input field
      this.fetchChatData(); // Fetch chat data again to display the new message
      return response;
    } else if (response.status === 400) {
      throw new Error("Bad request");
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
      `http://localhost:3333/api/1.0.0/chat/`+chatId+`/message/`+editMessageId,
      {
        method: 'PATCH',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: editTextMessage }),
      });
      
      if (response.status === 200) {
        this.setState({
          editMessageId: null,
          editTextMessage: '',
          isEditing: false,
        });
        this.fetchChatData();
      } else if (response.status === 400) {
        throw new Error("Bad request");
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
  
  deleteMessage = async (message_id) => {
    const { chatId } = this.props.route.params;

    this.setState({ isDeleting: true });

    try {
      const response = await fetch(
        `http://localhost:3333/api/1.0.0/chat/`+chatId+`/message/`+message_id,
        {
          method: 'DELETE',
          headers: {
            'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          },
        }
      );

      if(response.status === 200) {
        this.setState({ isDeleting: false });
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
        this.setState({ isDeleting: false, error });
      }
    };

render() {
const { chatData, textMessage, isLoading, isEditing, isDeleting, editMessageId, editTextMessage, error  } = this.state;

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
    <TouchableOpacity style={styles.closeButton} onPress={() => this.setState({ error: null })}>
      <Ionicons name="close-circle" size={24} color="black" />
    </TouchableOpacity>
    {error.message && <Text style={styles.errorText}>{error.message}</Text>}
  </View>
);
}  

return (
  <View style={styles.container}>
    <View style={styles.chatContainer}>
      <ScrollView
        ref={(scrollView) => {
          this.scrollView = scrollView;
        }}
        onContentSizeChange={() =>
          this.scrollView.scrollToEnd({ animated: true })
        }
      >
        {chatData.messages.sort((x, y) => x.timestamp - y.timestamp).map((message) => (
          <View key={message.message_id}>
            <View style={styles.messageHeader}>
              {message.author && (
                <Text style={styles.messageSender}>
                  {message.author.first_name} {message.author.last_name}
                </Text>
              )}
              <Text style={styles.messageTimestamp}>
                {new Date(message.timestamp * 1000).toLocaleTimeString()}
              </Text>
            </View>
            {editMessageId === message.message_id ? (
              <View style={styles.editMessageContainer}>
                <TextInput
                  style={styles.editMessageInput}
                  onChangeText={(text) =>
                    this.setState({ editTextMessage: text })
                  }
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
                    this.setState({ editMessageId: null, editTextMessage: "" });
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
                    style={styles.messageOptionButton}
                    onPress={() =>
                      this.setState({
                        editMessageId: message.message_id,
                        editTextMessage: message.message,
                      })
                    }
                  >
                    <Icon name="edit" size={24} color="green" />
                  </TouchableOpacity>
                </View>
              </>
            )}
            <View style={styles.horizontalLine} />
          </View>
        ))}
      </ScrollView>
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
      >
        <Icon name="send" size={24} color="#fff" style={styles.sendButtonIcon} />
      </TouchableOpacity>
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
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  messageSender: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  messageTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 16,
    marginHorizontal: 10,
    marginVertical: 5,
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
  horizontalLine: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
    marginHorizontal: 10,
  },                            
});