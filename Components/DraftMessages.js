import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class DraftMessages extends Component {
    constructor(props) {
        super(props);
        this.state = {
          chatData: [],
          isLoading: true,
          error: null,
          showSuccess: false,
        };
      }

componentDidMount() {
    this.props.navigation.addListener('focus', () => {
    this.fetchDraftsData();
});
}

fetchDraftsData = async () => {
    const { chatId } = this.props.route.params;
    try {
      const savedMessages = await AsyncStorage.getItem(`draft_messages_`+chatId);
      this.setState({ chatData: JSON.parse(savedMessages) || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching draft messages:', error);
      this.setState({ isLoading: false, error });
    }
  };
  
  render() {
    const { chatData, isLoading, error, } = this.state;
    
    if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6646ee" />
      </View>
    );
    }
    
    if (error) {
    return (
      <View style={styles.errorContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={() => this.setState({ error: null })}>
          <Ionicons name="close-circle" size={24} color="black" />
        </TouchableOpacity>
        {error.message && <Text style={styles.errorText}>{error.message}</Text>}
      </View>
    );
    }  
    
    return (
        <View style={styles.container}>
          <Text style={styles.formSubheading}>Draft Messages</Text>
          <ScrollView>
            {chatData.map((message) => (
              <View style={styles.message} key={message.message_id}>
                <Text>{message.message}</Text>
              </View>
            ))}
          </ScrollView>
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
    formSubheading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        marginVertical: 5,
    },
    successContainer: {
        backgroundColor: '#eaffea',
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
        position: 'relative',
    },
    successText: {
        color: '#008000',
        fontSize: 16,
        marginLeft: 10,
    },
    errorContainer: {
        backgroundColor: 'red',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
      },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
    },
    errorText: {
        color: '#fff',
        marginLeft: 10,
    },   
});