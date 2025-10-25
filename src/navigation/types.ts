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
};

export type MainTabParamList = {
  Personal: undefined;
  Groups: undefined;
};
