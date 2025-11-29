import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const RoomAchievementDefinitionMap = {
  [AchievementName.Inviter]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Room,
    description: "Create an invite link",
    icon: "mdi-link-plus",
    points: 10,
    triggerPath: "room.createInvite" as const,
  }),
  [AchievementName.PartyHost]: defineAchievementDefinition({
    amount: 10,
    category: AchievementCategory.Room,
    description: "Create 10 rooms",
    icon: "mdi-party-popper",
    points: 75,
    triggerPath: "room.createRoom" as const,
  }),
  [AchievementName.RoomCreator]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Room,
    description: "Create your first chat room",
    icon: "mdi-forum",
    points: 25,
    triggerPath: "room.createRoom" as const,
  }),
  [AchievementName.RoomDestroyer]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Room,
    description: "Delete a room",
    icon: "mdi-delete-forever",
    points: 10,
    triggerPath: "room.deleteRoom" as const,
  }),
  [AchievementName.RoomHopper]: defineAchievementDefinition({
    amount: 20,
    category: AchievementCategory.Room,
    description: "Join 20 rooms",
    icon: "mdi-run-fast",
    points: 60,
    triggerPath: "room.joinRoom" as const,
  }),
  [AchievementName.RoomJoiner]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Room,
    description: "Join a room",
    icon: "mdi-account-arrow-right",
    points: 10,
    triggerPath: "room.joinRoom" as const,
  }),
  [AchievementName.RoomLeaver]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Room,
    description: "Leave a room",
    icon: "mdi-exit-to-app",
    points: 5,
    triggerPath: "room.leaveRoom" as const,
  }),
  [AchievementName.RoomRenovator]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Room,
    description: "Update a room",
    icon: "mdi-home-edit",
    points: 10,
    triggerPath: "room.updateRoom" as const,
  }),
  [AchievementName.Socialite]: defineAchievementDefinition({
    amount: 5,
    category: AchievementCategory.Room,
    description: "Join 5 different chat rooms",
    icon: "mdi-account-group",
    points: 50,
    triggerPath: "room.joinRoom" as const,
  }),
};
