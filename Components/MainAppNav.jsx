/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
import React, { Component } from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// eslint-disable-next-line import/no-unresolved
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatList from './ChatList';
import ChatScreen from './ChatScreen';
import ChatInfo from './ChatInfo';
import DraftMessages from './DraftMessages';
import Blocked from './Blocked';
import Contacts from './Contacts';
import SearchContacts from './SearchContacts';
import Profile from './Profile';
import SearchUser from './SearchUser';
import CameraSend from './CameraSend';
import Logout from './Logout';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default class MainAppNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photo: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.get_profile_image();
      this.checkLoggedIn();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (!value || value === null) {
      const { navigation } = this.props;
      navigation.navigate('Login');
    }
  };

  get_profile_image = async () => {
    try {
      const userId = await AsyncStorage.getItem('whatsthat_user_id');
      const sessionToken = await AsyncStorage.getItem('whatsthat_session_token');
      const response = await fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
        method: 'GET',
        headers: {
          'X-Authorization': sessionToken,
        },
      });
      const blob = await response.blob();
      const data = URL.createObjectURL(blob);

      this.setState({
        photo: data,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  render() {
    const { photo } = this.state;

    return (
      <Tab.Navigator>
        <Tab.Screen
          name="ChatList"
          component={ChatNav}
          listeners={() => ({
            focus: () => {
              this.get_profile_image();
            },
          })}
          options={{
            tabBarLabel: 'Chat List',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="chatbox-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNav}
          listeners={() => ({
            focus: () => {
              this.get_profile_image();
            },
          })}
          options={{
            headerShown: false,
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Image
                source={{ uri: photo }}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderColor: color,
                  borderWidth: 1,
                }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="ContactsList"
          component={ContactsListNav}
          listeners={() => ({
            focus: () => {
              this.get_profile_image();
            },
          })}
          options={{
            tabBarLabel: 'Contacts',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SearchUser"
          component={SearchUser}
          listeners={() => ({
            focus: () => {
              this.get_profile_image();
            },
          })}
          options={{
            tabBarLabel: 'Search User',
            tabBarIcon: ({ color, size }) => (
              <Icon name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Logout"
          component={Logout}
          listeners={() => ({
            focus: () => {
              this.get_profile_image();
            },
          })}
          options={{
            tabBarLabel: 'Logout',
            tabBarIcon: ({ color, size }) => (
              <Icon name="log-out-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }
}

function ChatNav() {
  return (
    <Stack.Navigator initialRouteName="ChatListScreen">
      <Stack.Screen name="ChatListScreen" component={ChatList} options={{ headerShown: false }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ChatInfo" component={ChatInfo} />
      <Stack.Screen name="DraftMessages" component={DraftMessages} />
    </Stack.Navigator>
  );
}

function ContactsListNav() {
  return (
    <Stack.Navigator initialRouteName="Contacts">
      <Stack.Screen name="Contacts" component={Contacts} options={{ headerShown: false }} />
      <Stack.Screen name="SearchContacts" component={SearchContacts} />
      <Stack.Screen name="Blocked" component={Blocked} />
    </Stack.Navigator>
  );
}

function ProfileNav() {
  return (
    <Stack.Navigator initialRouteName="EditProfile">
      <Stack.Screen name="EditProfile" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="CameraSend" component={CameraSend} />
    </Stack.Navigator>
  );
}
