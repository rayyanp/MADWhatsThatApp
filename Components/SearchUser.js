import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class SearchUser extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>SearchUser Screen</Text>
      </View>
    );
  }
}
