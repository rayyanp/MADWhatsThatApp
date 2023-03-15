import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class ChatScreen extends Component {

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
    }
  } catch (error) {
    console.error('Error fetching chat data:', error);
  }
};

 
  render() {
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
