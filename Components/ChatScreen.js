import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class ChatScreen extends Component {

  componentDidMount() {
    this.props.navigation.addListener('focus', () => {
    this.fetchChatData();
  });
 }

 
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
