import type { AchievementDefinition } from "@@/server/models/achievement/AchievementDefinition";
import type { Except } from "type-fest";

import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { AchievementCategory } from "@@/server/models/achievement/AchievementCategory";
import { AchievementName, BinaryOperator } from "@esposter/db-schema";

const AchievementDefinitionMap = {
  [AchievementName.CenturyClub]: {
    amount: 100,
    category: AchievementCategory.Messaging,
    description: "Send 100 messages",
    icon: "mdi-message-multiple",
    points: 100,
    triggerPath: "message.createMessage",
  },
  [AchievementName.ConversationKeeper]: {
    amount: 50,
    category: AchievementCategory.Social,
    conditions: {
      operator: BinaryOperator.gt,
      path: "replyRowKey",
      type: "property",
      value: null,
    },
    description: "Reply to 50 messages",
    icon: "mdi-reply",
    points: 75,
    triggerPath: "message.createMessage",
  },
  [AchievementName.EssayWriter]: {
    category: AchievementCategory.Milestone,
    conditions: {
      operator: BinaryOperator.ge,
      path: "message.length",
      type: "property",
      value: 1000,
    },
    description: "Send a message with over 1,000 characters",
    icon: "mdi-text-long",
    points: 40,
    triggerPath: "message.createMessage",
  },
  [AchievementName.FileSharer]: {
    amount: 1,
    category: AchievementCategory.Messaging,
    conditions: {
      operator: BinaryOperator.gt,
      path: "files.length",
      type: "property",
      value: 0,
    },
    description: "Share your first file",
    icon: "mdi-file-upload",
    points: 20,
    triggerPath: "message.createMessage",
  },
  [AchievementName.FirstMessage]: {
    amount: 1,
    category: AchievementCategory.Messaging,
    description: "Send your first message",
    icon: "mdi-message-text",
    points: 10,
    triggerPath: "message.createMessage",
  },
  [AchievementName.MessageForwarder]: {
    amount: 1,
    category: AchievementCategory.Social,
    conditions: {
      operator: BinaryOperator.eq,
      path: "isForward",
      type: "property",
      value: true,
    },
    description: "Forward a message to another room",
    icon: "mdi-share",
    points: 15,
    triggerPath: "message.createMessage",
  },
  [AchievementName.MessageMaster]: {
    amount: 1000,
    category: AchievementCategory.Messaging,
    description: "Send 1,000 messages",
    icon: "mdi-message-star",
    points: 500,
    triggerPath: "message.createMessage",
  },
  [AchievementName.Meta]: {
    category: AchievementCategory.Special,
    conditions: {
      operator: "contains",
      path: "message",
      type: "property",
      value: "achievement unlocked",
    },
    description: 'Send a message containing "achievement unlocked"',
    icon: "mdi-trophy",
    isHidden: true,
    points: 100,
    triggerPath: "message.createMessage",
  },
  [AchievementName.NightOwl]: {
    category: AchievementCategory.Milestone,
    conditions: {
      endHour: 5,
      startHour: 0,
      type: "time",
    },
    description: "Send a message between midnight and 5 AM",
    icon: "mdi-weather-night",
    points: 30,
    triggerPath: "message.createMessage",
  },
  [AchievementName.PinCollector]: {
    amount: 10,
    category: AchievementCategory.Messaging,
    conditions: {
      operator: BinaryOperator.eq,
      path: "isPinned",
      type: "property",
      value: true,
    },
    description: "Pin 10 important messages",
    icon: "mdi-pin",
    points: 50,
    triggerPath: "message.updateMessage",
  },
  [AchievementName.ProlificPoster]: {
    amount: 25,
    category: AchievementCategory.Milestone,
    description: "Create 25 posts",
    icon: "mdi-magnify",
    points: 35,
    triggerPath: "post.createPost",
  },
  [AchievementName.RoomCreator]: {
    amount: 1,
    category: AchievementCategory.Social,
    description: "Create your first chat room",
    icon: "mdi-forum",
    points: 25,
    triggerPath: "room.createRoom",
  },
  [AchievementName.SecondThoughts]: {
    amount: 10,
    category: AchievementCategory.Special,
    description: "Delete 10 of your own messages",
    icon: "mdi-delete",
    points: 20,
    triggerPath: "message.deleteMessage",
  },
  [AchievementName.Socialite]: {
    amount: 5,
    category: AchievementCategory.Social,
    description: "Join 5 different chat rooms",
    icon: "mdi-account-group",
    points: 50,
    triggerPath: "userToRoom.createUserToRoom",
  },
} as const satisfies Record<AchievementName, Except<AchievementDefinition, "name">>;

export const achievementDefinitions: AchievementDefinition[] = parseDictionaryToArray(AchievementDefinitionMap, "name");
