import type { NewAchievement } from "@esposter/db-schema";

import { AchievementCategory, AchievementType } from "@esposter/db-schema";

export interface AchievementDefinition extends Omit<NewAchievement, "id" | "createdAt" | "updatedAt" | "deletedAt"> {
  key: string;
  checkCriteria: (eventData: unknown) => number;
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    category: AchievementCategory.Messaging,
    checkCriteria: () => 1,
    description: "Send your first message",
    icon: "mdi-message-text",
    key: "first_message",
    metadata: { eventType: "message.createMessage" },
    name: "First Message",
    points: 10,
    targetProgress: 1,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Messaging,
    checkCriteria: () => 1,
    description: "Send 100 messages",
    icon: "mdi-message-multiple",
    key: "century_club",
    metadata: { eventType: "message.createMessage" },
    name: "Century Club",
    points: 100,
    targetProgress: 100,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Messaging,
    checkCriteria: () => 1,
    description: "Send 1,000 messages",
    icon: "mdi-message-star",
    key: "message_master",
    metadata: { eventType: "message.createMessage" },
    name: "Message Master",
    points: 500,
    targetProgress: 1000,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Messaging,
    checkCriteria: (eventData: any) => (eventData?.result?.files?.length > 0 ? 1 : 0),
    description: "Share your first file",
    icon: "mdi-file-upload",
    key: "file_sharer",
    metadata: { eventType: "message.createMessage" },
    name: "File Sharer",
    points: 20,
    targetProgress: 1,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Messaging,
    checkCriteria: (eventData: any) => (eventData?.result?.isPinned ? 1 : 0),
    description: "Pin 10 important messages",
    icon: "mdi-pin",
    key: "pin_collector",
    metadata: { eventType: "message.updateMessage" },
    name: "Pin Collector",
    points: 50,
    targetProgress: 10,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Social,
    checkCriteria: () => 1,
    description: "Create your first chat room",
    icon: "mdi-forum",
    key: "room_creator",
    metadata: { eventType: "room.createRoom" },
    name: "Room Creator",
    points: 25,
    targetProgress: 1,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Social,
    checkCriteria: () => 1,
    description: "Join 5 different chat rooms",
    icon: "mdi-account-group",
    key: "socialite",
    metadata: { eventType: "userToRoom.createUserToRoom" },
    name: "Socialite",
    points: 50,
    targetProgress: 5,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Social,
    checkCriteria: (eventData: any) => (eventData?.result?.isForward ? 1 : 0),
    description: "Forward a message to another room",
    icon: "mdi-share",
    key: "message_forwarder",
    metadata: { eventType: "message.createMessage" },
    name: "Message Forwarder",
    points: 15,
    targetProgress: 1,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Social,
    checkCriteria: (eventData: any) => (eventData?.result?.replyRowKey ? 1 : 0),
    description: "Reply to 50 messages",
    icon: "mdi-reply",
    key: "conversation_keeper",
    metadata: { eventType: "message.createMessage" },
    name: "Conversation Keeper",
    points: 75,
    targetProgress: 50,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Milestone,
    checkCriteria: (_eventData: any) => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5 ? 1 : 0;
    },
    description: "Send a message between midnight and 5 AM",
    icon: "mdi-weather-night",
    key: "night_owl",
    metadata: { eventType: "message.createMessage" },
    name: "Night Owl",
    points: 30,
    type: AchievementType.Instant,
  },
  {
    category: AchievementCategory.Milestone,
    checkCriteria: (eventData: any) => {
      const messageLength = eventData?.result?.message?.length || 0;
      return messageLength >= 1000 ? 1 : 0;
    },
    description: "Send a message with over 1,000 characters",
    icon: "mdi-text-long",
    key: "essay_writer",
    metadata: { eventType: "message.createMessage" },
    name: "Essay Writer",
    points: 40,
    type: AchievementType.Instant,
  },
  {
    category: AchievementCategory.Milestone,
    checkCriteria: () => 1,
    description: "Create 25 posts",
    icon: "mdi-magnify",
    key: "prolific_poster",
    metadata: { eventType: "post.createPost" },
    name: "Prolific Poster",
    points: 35,
    targetProgress: 25,
    type: AchievementType.Progressive,
  },
  {
    category: AchievementCategory.Special,
    checkCriteria: (eventData: any) => {
      const message = eventData?.result?.message?.toLowerCase() || "";
      return message.includes("achievement unlocked") ? 1 : 0;
    },
    description: 'Send a message containing "achievement unlocked"',
    icon: "mdi-trophy",
    isHidden: true,
    key: "meta",
    metadata: { eventType: "message.createMessage" },
    name: "Meta",
    points: 100,
    type: AchievementType.Instant,
  },
  {
    category: AchievementCategory.Special,
    checkCriteria: () => 1,
    description: "Delete 10 of your own messages",
    icon: "mdi-delete",
    key: "second_thoughts",
    metadata: { eventType: "message.deleteMessage" },
    name: "Second Thoughts",
    points: 20,
    targetProgress: 10,
    type: AchievementType.Progressive,
  },
];

export const getAchievementDefinition = (key: string): AchievementDefinition | undefined =>
  achievementDefinitions.find((def) => def.key === key);

export const getAchievementDefinitionsByEventType = (eventType: string): AchievementDefinition[] =>
  achievementDefinitions.filter((def) => def.metadata.eventType === eventType);
