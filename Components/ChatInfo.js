import React, {Component} from 'react';
import {Text, View, FlatList, ActivityIndicator, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default class ChatInfoScreen extends Component {
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

render() {
  const { members, error } = this.state;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!members) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.chatName}>{chatName}</Text>
      </View>  
      <FlatList
          data={members}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.memberContainer}>
              <Text style={styles.memberNameText}>
                {item.first_name} {item.last_name}
              </Text>
            </View>
          )}
        />
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
  errorContainer: {
    backgroundColor: 'red',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#075e54',
  },
  chatName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  membersContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberNameText: {
    flex: 1,fontSize: 16,
  },
});
