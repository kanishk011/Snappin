import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import ChatNavigator from './ChatNavigator';
import StatusScreen from '../screens/StatusScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MainTabParamList } from './types';
import { COLORS, SIZES } from '../config/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: SIZES.fontSm,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: COLORS.primary,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontSize: SIZES.fontXl,
            fontWeight: '700',
          },
        }}
      >
        <Tab.Screen
          name="Chats"
          component={ChatNavigator}
          options={{
            headerTitle: 'Snappin',
            tabBarLabel: 'Chats',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                  size={focused ? 26 : 24}
                  color={color}
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Status"
          component={StatusScreen}
          options={{
            headerTitle: 'Status',
            tabBarLabel: 'Status',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name={focused ? 'donut-large' : 'donut-large'}
                  size={focused ? 26 : 24}
                  color={color}
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerTitle: 'Settings',
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={focused ? 'settings' : 'settings-outline'}
                  size={focused ? 26 : 24}
                  color={color}
                />
                {focused && <View style={styles.activeIndicator} />}
              </View>
            ),
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});

export default MainTabNavigator;
