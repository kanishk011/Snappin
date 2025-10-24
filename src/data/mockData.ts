import { Contact, Group, ChatData } from '../types';
import { IMessage } from 'react-native-gifted-chat';

export const mockContacts: Contact[] = [
  {
    _id: 2,
    name: 'Alice Johnson',
    avatar: 'https://placeimg.com/140/140/people',
    status: 'online',
    lastMessage: 'Hey! How are you?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    _id: 3,
    name: 'Bob Smith',
    avatar: 'https://placeimg.com/140/140/people',
    status: 'offline',
    lastMessage: 'See you tomorrow!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    _id: 4,
    name: 'Charlie Brown',
    avatar: 'https://placeimg.com/140/140/people',
    status: 'online',
    lastMessage: 'Thanks for your help',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    _id: 5,
    name: 'Diana Prince',
    avatar: 'https://placeimg.com/140/140/people',
    status: 'online',
    lastMessage: 'Let me know when you are free',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 120),
  },
];

export const mockGroups: Group[] = [
  {
    _id: 101,
    name: 'Team Alpha',
    avatar: 'https://placeimg.com/140/140/tech',
    members: [
      { _id: 2, name: 'Alice Johnson' },
      { _id: 3, name: 'Bob Smith' },
      { _id: 1, name: 'You' },
    ],
    lastMessage: 'Alice: Let\'s schedule the meeting',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    _id: 102,
    name: 'Project Beta',
    avatar: 'https://placeimg.com/140/140/tech',
    members: [
      { _id: 4, name: 'Charlie Brown' },
      { _id: 5, name: 'Diana Prince' },
      { _id: 1, name: 'You' },
    ],
    lastMessage: 'Charlie: Great work everyone!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    _id: 103,
    name: 'Family Group',
    avatar: 'https://placeimg.com/140/140/people',
    members: [
      { _id: 6, name: 'Mom' },
      { _id: 7, name: 'Dad' },
      { _id: 1, name: 'You' },
    ],
    lastMessage: 'Mom: Dinner at 7 PM',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 90),
  },
];

export const mockChatData: ChatData = {
  'personal-2': [
    {
      _id: 1,
      text: 'Hey! How are you?',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      user: {
        _id: 2,
        name: 'Alice Johnson',
        avatar: 'https://placeimg.com/140/140/people',
      },
    },
    {
      _id: 2,
      text: 'I\'m good! How about you?',
      createdAt: new Date(Date.now() - 1000 * 60 * 4),
      user: {
        _id: 1,
        name: 'You',
      },
    },
  ],
  'personal-3': [
    {
      _id: 1,
      text: 'See you tomorrow!',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      user: {
        _id: 3,
        name: 'Bob Smith',
        avatar: 'https://placeimg.com/140/140/people',
      },
    },
  ],
  'personal-4': [
    {
      _id: 1,
      text: 'Thanks for your help',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      user: {
        _id: 4,
        name: 'Charlie Brown',
        avatar: 'https://placeimg.com/140/140/people',
      },
    },
  ],
  'personal-5': [
    {
      _id: 1,
      text: 'Let me know when you are free',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      user: {
        _id: 5,
        name: 'Diana Prince',
        avatar: 'https://placeimg.com/140/140/people',
      },
    },
  ],
  'group-101': [
    {
      _id: 1,
      text: 'Let\'s schedule the meeting',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      user: {
        _id: 2,
        name: 'Alice Johnson',
        avatar: 'https://placeimg.com/140/140/people',
      },
    },
    {
      _id: 2,
      text: 'How about 3 PM today?',
      createdAt: new Date(Date.now() - 1000 * 60 * 9),
      user: {
        _id: 3,
        name: 'Bob Smith',
        avatar: 'https://placeimg.com/140/140/people',
      },
    },
  ],
  'group-102': [
    {
      _id: 1,
      text: 'Great work everyone!',
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      user: {
        _id: 4,
        name: 'Charlie Brown',
        avatar: 'https://placeimg.com/140/140/people',
      },
    },
  ],
  'group-103': [
    {
      _id: 1,
      text: 'Dinner at 7 PM',
      createdAt: new Date(Date.now() - 1000 * 60 * 90),
      user: {
        _id: 6,
        name: 'Mom',
      },
    },
  ],
};
