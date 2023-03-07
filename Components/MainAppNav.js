import { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatList from './ChatList';
import ChatScreen from './ChatScreen';
import ChatInfo from './ChatInfo';
import Contacts from './Contacts';

import Profile from './Profile';
import SearchUser from './SearchUser';
import Logout from './Logout';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default class MainAppNav extends Component {
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
  }
  componentWillUnmount() {
    this.unsubscribe();
  }

  checkLoggedIn = async () => { 
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (!value || value === null) {
      this.props.navigation.navigate('Login');
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
            tabBarIcon: ({ color, size }) => (
              <Icon name="chatbox-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Icon name="person-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ContactsList"
          component={Contacts}
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
      </Stack.Navigator>
    );
  }