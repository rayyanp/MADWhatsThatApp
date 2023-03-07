import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class Blocked extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>Blocked Contacts Screen</Text>
      </View>
    );
  }
}
