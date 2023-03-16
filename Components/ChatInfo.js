import React, {Component} from 'react';
import {Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export class ChatInfoScreen extends Component {
  state = {
    members: [],
    error: null,
  };

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
    const chatId = this.props.route.params.chatId;
    this.fetchChatData(chatId);
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
      this.setState({ error: error.message});
    }
  };
}