import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import CustomTab from './src/components/CustomTab';
import ContactList from './src/screens/ContactList';
import GroupList from './src/screens/GroupList';
import ChatScreen from './src/screens/ChatScreen';
import { TabType, ScreenType, Contact, Group, ChatData } from './src/types';
import { mockContacts, mockGroups, mockChatData } from './src/data/mockData';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Personal');
  const [screenType, setScreenType] = useState<ScreenType>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [chatData, setChatData] = useState<ChatData>(mockChatData);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setScreenType('list');
    setSelectedContact(null);
    setSelectedGroup(null);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setScreenType('chat');
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setScreenType('chat');
  };

  const handleBackToList = () => {
    setScreenType('list');
    setSelectedContact(null);
    setSelectedGroup(null);
  };

  const handleSendMessage = (newMessages: IMessage[]) => {
    const chatKey = selectedContact
      ? `personal-${selectedContact._id}`
      : `group-${selectedGroup?._id}`;

    setChatData(prevData => ({
      ...prevData,
      [chatKey]: GiftedChat.append(prevData[chatKey] || [], newMessages),
    }));
  };

  const getCurrentMessages = (): IMessage[] => {
    if (selectedContact) {
      return chatData[`personal-${selectedContact._id}`] || [];
    }
    if (selectedGroup) {
      return chatData[`group-${selectedGroup._id}`] || [];
    }
    return [];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {screenType === 'list' && (
        <>
          <CustomTab activeTab={activeTab} onTabChange={handleTabChange} />
          {activeTab === 'Personal' ? (
            <ContactList
              contacts={mockContacts}
              onSelectContact={handleSelectContact}
            />
          ) : (
            <GroupList
              groups={mockGroups}
              onSelectGroup={handleSelectGroup}
            />
          )}
        </>
      )}

      {screenType === 'chat' && (
        <ChatScreen
          chatType={selectedContact ? 'personal' : 'group'}
          contact={selectedContact || undefined}
          group={selectedGroup || undefined}
          initialMessages={getCurrentMessages()}
          onBack={handleBackToList}
          onSendMessage={handleSendMessage}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
