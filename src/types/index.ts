import { IMessage } from 'react-native-gifted-chat';

export interface User {
  _id: number;
  name: string;
  avatar?: string;
}

export interface Contact extends User {
  status?: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: Date;
}

export interface Group {
  _id: number;
  name: string;
  avatar?: string;
  members: User[];
  lastMessage?: string;
  lastMessageTime?: Date;
}

export interface ChatData {
  [key: string]: IMessage[];
}

export type TabType = 'Personal' | 'Group';

export type ScreenType = 'list' | 'chat';
