// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { RoomAchievementName } from "@esposter/db-schema";

export const RoomAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Room, {
  [RoomAchievementName.Inviter]: defineAchievementDefinition({
    amount: 1,
    description: "Create an invite link",
    icon: "i-mdi:link-plus",
    points: 10,
    triggerPath: "room.createInvite",
  }),
  [RoomAchievementName.PartyHost]: defineAchievementDefinition({
    amount: 10,
    description: "Create 10 rooms",
    icon: "i-mdi:party-popper",
    points: 75,
    triggerPath: "room.createRoom",
  }),
  [RoomAchievementName.RoomCreator]: defineAchievementDefinition({
    amount: 1,
    description: "Create your first chat room",
    icon: "i-mdi:forum",
    points: 25,
    triggerPath: "room.createRoom",
  }),
  [RoomAchievementName.RoomDestroyer]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a room",
    icon: "i-mdi:delete-forever",
    points: 10,
    triggerPath: "room.deleteRoom",
  }),
  [RoomAchievementName.RoomHopper]: defineAchievementDefinition({
    amount: 20,
    description: "Join 20 rooms",
    icon: "i-mdi:run-fast",
    points: 60,
    triggerPath: "room.joinRoom",
  }),
  [RoomAchievementName.RoomJoiner]: defineAchievementDefinition({
    amount: 1,
    description: "Join a room",
    icon: "i-mdi:account-arrow-right",
    points: 10,
    triggerPath: "room.joinRoom",
  }),
  [RoomAchievementName.RoomLeaver]: defineAchievementDefinition({
    amount: 1,
    description: "Leave a room",
    icon: "i-mdi:exit-to-app",
    points: 5,
    triggerPath: "room.leaveRoom",
  }),
  [RoomAchievementName.RoomRenovator]: defineAchievementDefinition({
    amount: 1,
    description: "Update a room",
    icon: "i-mdi:home-edit",
    points: 10,
    triggerPath: "room.updateRoom",
  }),
  [RoomAchievementName.Socialite]: defineAchievementDefinition({
    amount: 5,
    description: "Join 5 different chat rooms",
    icon: "i-mdi:account-group",
    points: 50,
    triggerPath: "room.joinRoom",
  }),
});
