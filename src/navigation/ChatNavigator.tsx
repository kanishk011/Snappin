import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet } from 'react-native';
import ContactList from '../screens/ContactList';
import GroupList from '../screens/GroupList';

const Tab = createMaterialTopTabNavigator();

const ChatNavigator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#25D366',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#25D366',
            height: 3,
            borderRadius: 2,
          },
          tabBarPressColor: '#25D36620',
        }}
      >
        <Tab.Screen
          name="PersonalChats"
          component={ContactList}
          options={{
            tabBarLabel: 'Personal',
          }}
        />
        <Tab.Screen
          name="GroupChats"
          component={GroupList}
          options={{
            tabBarLabel: 'Groups',
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ChatNavigator;
