import React, { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatList from './ChatList';
import ChatScreen from './ChatScreen';
import ChatInfo from './ChatInfo';
import DraftMessages from './DraftMessages';
import AddContactChat from './AddContactChat';
import Blocked from './Blocked';
import Contacts from './Contacts';
import SearchContacts from './SearchContacts';
import Profile from './Profile';
import SearchUser from './SearchUser';
import CameraSend from './CameraSend';
import Logout from './Logout';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ChatNav() {
  return (
    <Stack.Navigator initialRouteName="ChatListScreen">
      <Stack.Screen name="ChatListScreen" component={ChatList} options={{ headerShown: false }} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat Screen' }} />
      <Stack.Screen name="ChatInfo" component={ChatInfo} options={{ title: 'Manage Chat' }} />
      <Stack.Screen name="DraftMessages" component={DraftMessages} options={{ title: 'Draft Messages' }} />
      <Stack.Screen name="AddContactChat" component={AddContactChat} options={{ title: 'Add User to Chat' }} />
    </Stack.Navigator>
  );
}

function ContactsListNav() {
  return (
    <Stack.Navigator initialRouteName="Contacts">
      <Stack.Screen name="Contacts" component={Contacts} options={{ headerShown: false }} />
      <Stack.Screen name="SearchContacts" component={SearchContacts} options={{ title: 'Search Contacts' }} />
      <Stack.Screen name="Blocked" component={Blocked} options={{ title: 'Blocked Users' }} />
    </Stack.Navigator>
  );
}

function ProfileNav() {
  return (
    <Stack.Navigator initialRouteName="EditProfile">
      <Stack.Screen name="EditProfile" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="CameraSend" component={CameraSend} options={{ title: 'Camera' }} />
    </Stack.Navigator>
  );
}

function ChatIcon({ color, size }) {
  return <Icon name="chatbox-outline" size={size} color={color} />;
}

function ProfileIcon({ color, size }) {
  return <Icon name="person-outline" size={size} color={color} />;
}

function ContactsIcon({ color, size }) {
  return <Icon name="people-outline" size={size} color={color} />;
}

function SearchIcon({ color, size }) {
  return <Icon name="search-outline" size={size} color={color} />;
}

function LogoutIcon({ color, size }) {
  return <Icon name="log-out-outline" size={size} color={color} />;
}

export default class MainAppNav extends Component {
  componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
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

  render() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="ChatList"
          component={ChatNav}
          options={{
            tabBarLabel: 'Chat List',
            headerShown: false,
            tabBarIcon: ChatIcon,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNav}
          options={{
            headerShown: false,
            tabBarLabel: 'Profile',
            tabBarIcon: ProfileIcon,
          }}
        />
        <Tab.Screen
          name="ContactsList"
          component={ContactsListNav}
          options={{
            tabBarLabel: 'Contacts',
            headerShown: false,
            tabBarIcon: ContactsIcon,
          }}
        />
        <Tab.Screen
          name="SearchUser"
          component={SearchUser}
          options={{
            tabBarLabel: 'Search User',
            tabBarIcon: SearchIcon,
          }}
        />
        <Tab.Screen
          name="Logout"
          component={Logout}
          options={{
            tabBarLabel: 'Logout',
            tabBarIcon: LogoutIcon,
          }}
        />
      </Tab.Navigator>
    );
  }
}
