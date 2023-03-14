import React, { Component } from 'react';
import { View, Text, TextInput, Button, StyleSheet,ScrollView, SectionList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class SearchContacts extends Component {
  state = {
    query: '',
    searchIn: 'contacts',
    limit: 20,
    offset: 0,
    users: [],
    showSuccess: false,
    error: ''
  };

  searchContacts = async () => {
    const { query, searchIn, limit, offset } = this.state;

    fetch(`http://localhost:3333/api/1.0.0/search?q=`+query+`&search_in=`+searchIn+`&limit=`+limit+`&offset=`+offset, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Accept': 'application/json',
      },
    })
      .then(response => {
        if (response.status === 200) {
          console.log('OK');
        } else if (response.status === 400) {
          console.error('Bad Request');
        } else if (response.status === 401) {
          console.error('Unauthorized');
        } else if (response.status === 500) {
          console.error('Server Error');
        }
        return response.json();
      })
      .then(data => {
        if (data.length === 0) {
          this.setState({ error: 'No results' });
        } else {
          this.setState({ users: data, error: '' });
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  nextPage = async () => {
    const { query, searchIn, limit, offset } = this.state;
    const newOffset = offset + limit;
    await this.setState({ offset: newOffset });
    this.searchContacts();
  };
  
  previousPage = async () => {
    const { query, searchIn, limit, offset } = this.state;
    const newOffset = offset - limit;
    await this.setState({ offset: newOffset < 0 ? 0 : newOffset });
    this.searchContacts();
  };

  renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{`${item.given_name} ${item.family_name}`}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </View>
  );  

  renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );


  render() {
    const { users, error } = this.state;
  
    const sections = [{ title: 'Contacts', data: users }];
  
    return (
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TextInput
            placeholder="Search contacts by first name, last name or email"
            placeholderTextColor="#C4C4C4"
            style={styles.searchInput}
            onChangeText={(query) => this.setState({ query })}
          />
          <Icon name="search" size={20} color="#fff" onPress={this.searchContacts} style={styles.searchButton} />
        </View>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView>
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.user_id}
              renderItem={this.renderItem}
              renderSectionHeader={this.renderSectionHeader}
            />
            <View style={styles.paginationContainer}>
              <View style={styles.buttonContainer}>
                <Button title="Previous Page" onPress={this.previousPage} disabled={this.state.offset === 0} />
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Next Page" onPress={this.nextPage} disabled={this.state.users.length < this.state.limit} />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5FCFF',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  addContactButton: {
    marginLeft: 10,
  },
  sectionHeader: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffeaea',
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});