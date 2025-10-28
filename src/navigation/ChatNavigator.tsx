import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet } from 'react-native';
import ContactList from '../screens/ContactList';
import GroupList from '../screens/GroupList';
import { COLORS, SIZES } from '../config/theme';

const Tab = createMaterialTopTabNavigator();

const ChatNavigator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: SIZES.fontSm,
            fontWeight: '600',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarIndicatorStyle: {
            backgroundColor: COLORS.primary,
            height: 3,
            borderRadius: 2,
          },
          tabBarPressColor: `${COLORS.primary}20`,
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
    backgroundColor: COLORS.surface,
  },
});

export default ChatNavigator;
