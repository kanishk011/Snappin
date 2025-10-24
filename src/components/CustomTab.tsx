import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TabType } from '../types';

interface CustomTabProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const CustomTab: React.FC<CustomTabProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Personal' && styles.activeTab]}
        onPress={() => onTabChange('Personal')}
      >
        <Text style={[styles.tabText, activeTab === 'Personal' && styles.activeTabText]}>
          Personal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'Group' && styles.activeTab]}
        onPress={() => onTabChange('Group')}
      >
        <Text style={[styles.tabText, activeTab === 'Group' && styles.activeTabText]}>
          Group
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '700',
  },
});

export default CustomTab;
