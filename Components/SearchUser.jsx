/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Button, StyleSheet, ScrollView, SectionList, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Ionicons } from '@expo/vector-icons';
// eslint-disable-next-line import/no-unresolved
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    flexDirection: 'row',
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
    fontSize: 18,
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
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noPhotoText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default class SearchUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      searchIn: 'all',
      limit: 20,
      offset: 0,
      users: [],
      showSuccess: false,
      error: '',
      photos: {}, // map of contact IDs to photo URLs
    };
  }

  searchUsers = async () => {
    const {
      query, searchIn, limit, offset,
    } = this.state;

    if (!query) {
      this.setState({ error: 'Please enter a search query' });
      return;
    }

    fetch(`http://localhost:3333/api/1.0.0/search?q=${query}&search_in=${searchIn}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        Accept: 'application/json',
      },
    })
      .then((response) => {
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
      .then(async (data) => {
        const users = data.map((user) => ({
          ...user,
          id: user.user_id.toString(),
        }));
        // Call get_profile_image for each contact
        // eslint-disable-next-line no-restricted-syntax
        for (const user of users) {
          // eslint-disable-next-line no-await-in-loop
          await this.get_profile_image(user.id);
        }
        if (data.length === 0) {
          this.setState({ error: 'No results' });
        } else {
          this.setState({ users: data, error: '' });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  get_profile_image = async (userId) => {
    const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
    fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': sessionToken,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        }
        if (res.status === 401) {
          throw new Error('Unauthorized');
        } else if (res.status === 404) {
          throw new Error('Not Found');
        } else {
          throw new Error('Server Error');
        }
      })
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);
        this.setState((prevState) => ({
          photos: {
            ...prevState.photos,
            [userId]: data,
          },
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  nextPage = async () => {
    const {
      limit, offset,
    } = this.state;
    const newOffset = offset + limit;
    await this.setState({ offset: newOffset });
    this.searchUsers();
  };

  previousPage = async () => {
    const {
      limit, offset,
    } = this.state;
    const newOffset = offset - limit;
    await this.setState({ offset: newOffset < 0 ? 0 : newOffset });
    this.searchUsers();
  };

  addContact = async (id) => {
    fetch(`http://localhost:3333/api/1.0.0/user/${id}/contact`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log('User added to contacts');
          this.setState({ showSuccess: true });
        } else if (response.status === 400) {
          console.error('You cant add yourself as a contact');
        } else if (response.status === 401) {
          console.error('Unauthorized');
        } else if (response.status === 404) {
          console.error('User not found');
        } else if (response.status === 500) {
          console.error('Server Error');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  renderItem = ({ item }) => {
    const { photos } = this.state;
    return (
      <View style={styles.item}>
        <View style={styles.userInfo}>
          <View style={styles.photoContainer}>
            {photos[item.user_id] ? (
              <Image source={{ uri: photos[item.user_id] }} style={styles.photo} />
            ) : (
              <Text style={styles.noPhotoText}>No photo</Text>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.name}>{`${item.given_name} ${item.family_name}`}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>
        <Button
          title="Add Contact"
          onPress={() => this.addContact(item.user_id)}
          style={styles.addContactButton}
        />
      </View>
    );
  };

  renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );

  render() {
    const {
      users, error, showSuccess, offset, limit,
    } = this.state;

    const sections = [{ title: 'Users', data: users }];

    return (
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TextInput
            placeholder="Search users by first name, last name or email"
            placeholderTextColor="#C4C4C4"
            style={styles.searchInput}
            onChangeText={(query) => this.setState({ query })}
          />
          <Icon name="search" size={20} color="#fff" onPress={this.searchUsers} style={styles.searchButton} />
        </View>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView>
            {showSuccess && (
              <View style={styles.successContainer}>
                <TouchableOpacity
                  onPress={() => this.setState({ showSuccess: false })}
                  style={styles.closeButton}
                >
                  <Ionicons name="close-circle" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.successText}>User added to contacts!</Text>
              </View>
            )}
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.user_id}
              renderItem={this.renderItem}
              renderSectionHeader={this.renderSectionHeader}
            />
            <View style={styles.paginationContainer}>
              <View style={styles.buttonContainer}>
                <Button title="Previous Page" onPress={this.previousPage} disabled={offset === 0} />
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Next Page" onPress={this.nextPage} disabled={users.length < limit} />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}
