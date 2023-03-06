import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>MAD WhatsThatApp!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const AuthStack = createNativeStackNavigator();

export default function App() {
    return (
      <NavigationContainer>
        <AuthStack.Navigator initialRouteName="Login">
          <AuthStack.Screen name="Login" component={Login} options={{headerShown: false}} />
          <AuthStack.Screen name="Register" component={Register} options={{headerShown: false}} />
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
