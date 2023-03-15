import React, {Component} from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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


render() {
  const { chatData, error, isLoading } = this.state;
  const { chatId } = this.props.route.params;  

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color="#6646ee" />
      </View>
    );
  }  

  if (error) {
    return (
      <View>
        <TouchableOpacity onPress={() => this.setState({ error: null })}>
          <Ionicons name="close-circle" size={24} color="black" />
        </TouchableOpacity>
        {error.message && <Text>{error.message}</Text>}
      </View>
    );
  }

  const { messages } = chatData;

  // Sort messages by timestamp in ascending order
  const orderedMessages = messages.sort((x, y) => x.timestamp - y.timestamp);

  return (
    <View>
      {orderedMessages.map((message) => (
        <Text>{message.message}</Text>
      ))}
    </View>
  );
}
}