import { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
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
      </Tab.Navigator>
    );
  }
}


