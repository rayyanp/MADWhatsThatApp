import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class ChatListScreen extends Component {
  state = {
    chats: [],
    newChatName: '',
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

  createChat = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.newChatName,
        }),
      });
  
      if (response.status === 201) {
        const json = await response.json();
        console.log(json);
        // Clear the chat name input field
        this.setState({ newChatName: '' });
        // Refresh the chat list
        this.fetchChats();
      } else if (response.status === 400) {
        throw new Error("Bad request");
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Error');
      }
    } catch (error) {
      console.error(error);
    }
  };

renderChatItem = ({ item }) => {
  return (
    <TouchableOpacity
      onPress={() =>
        this.props.navigation.navigate('ChatScreen', { chatId: item.chat_id })
      }
    >
      <View>
        <Text>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

render() {
  const { chats, newChatName } = this.state;
  return (
    <View style={styles.container}>
    <View style={styles.headerContainer}>
      <Text style={styles.header}>Chats</Text>
      </View>
      <View>
        <TextInput
          onChangeText={(text) => this.setState({ newChatName: text })}
          value={newChatName}
          placeholder="Enter new chat name"
        />
        <TouchableOpacity onPress={this.createChat}>
          <Text>Create</Text>
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 15,
    paddingTop: 30,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});