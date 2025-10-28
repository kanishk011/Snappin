import { Contact, Group } from '../types';
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Chat: {
    chatType: 'personal' | 'group';
    contact?: Contact;
    group?: Group;
  };
  NewChat: undefined;
  NewGroup: undefined;
};

export type MainTabParamList = {
  Chats: undefined;
  Status: undefined;
  Settings: undefined;
};

export type ChatTabParamList = {
  PersonalChats: undefined;
  GroupChats: undefined;
};
