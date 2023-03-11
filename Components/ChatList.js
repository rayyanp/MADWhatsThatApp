import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class ChatListScreen extends Component {
  state = {
    chats: [],
  };

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
    this.fetchChats();
  });
  }

  fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          Accept: 'application/json',
        },
      });
      if (response.status === 200) {
        const json = await response.json();
        const chats = json.map(({ chat_id, name, creator, last_message }) => ({
          chat_id,
          name,
          creator: {
            user_id: creator.user_id,
            first_name: creator.first_name,
            last_name: creator.last_name,
            email: creator.email,
          },
          last_message: last_message ? {
            message_id: last_message.message_id,
            timestamp: last_message.timestamp,
            message: last_message.message,
            author: {
              user_id: last_message.author.user_id,
              first_name: last_message.author.first_name,
              last_name: last_message.author.last_name,
              email: last_message.author.email,
            },
          } : null,
        }));
        this.setState({ chats });
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Not Found');
      }
    } catch (error) {
      console.error(error);
    }
  };

renderChatItem = ({ item }) => {
  return (
    <View
    >
      <View>
        <Text>{item.name}</Text>
      </View>
    </View>
  );
};

render() {
  const { chats } = this.state;
  return (
    <View>
      <View>
        <Text>Chats</Text>
      </View>
      <FlatList
        data={chats}
        renderItem={this.renderChatItem}
        keyExtractor={(item) => item.chat_id.toString()}
      />
    </View>
  );
}
}