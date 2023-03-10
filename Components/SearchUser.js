import React, {Component} from 'react';
import {Text, View, TextInput, ScrollView, SectionList, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class SearchUsers extends Component {
  state = {
    query: '',
    searchIn: 'all',
    limit: 20,
    offset: 0,
    users: [],
  };

  searchUsers = async () => {
    const { query, searchIn, limit, offset } = this.state;

    if (!query) {
      this.setState({ error: 'Please enter a search query' });
      return;
    }

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
          this.setState({ users: data,});
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  renderItem = ({ item }) => (
    <View>
      <View>
        <Text>{item.name}</Text>
        <Text>{item.email}</Text>
      </View>
    </View>
  );

  renderSectionHeader = ({ section: { title } }) => (
    <View>
      <Text>{title}</Text>
    </View>
  );


  render() {
    const { users } = this.state;
  
    const sections = [{ title: 'Users', data: users }];
  
    return (
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TextInput
            placeholder="Search users"
            style={styles.searchInput}
            onChangeText={(query) => this.setState({ query })}
          />
          <Button title="Search" onPress={this.searchUsers} style={styles.searchButton} />
        </View>
          <ScrollView>
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.user_id}
              renderItem={this.renderItem}
              renderSectionHeader={this.renderSectionHeader}
            />
          </ScrollView>
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
    width: 80,
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
});