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
      this.setState({ chatData: data });
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
    this.setState({ error });
  }
};

 
render() {
  const { chatData, error  } = this.state;
  const { chatId } = this.props.route.params;  

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

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>ChatScreen</Text>
      </View>
    );
  }
}
