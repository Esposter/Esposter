// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { createInviteInputSchema } from "#shared/models/db/room/CreateInviteInput";
import { createRoomInputSchema } from "#shared/models/db/room/CreateRoomInput";
import { deleteRoomInputSchema } from "#shared/models/db/room/DeleteRoomInput";
import { joinRoomInputSchema } from "#shared/models/db/room/JoinRoomInput";
import { leaveRoomInputSchema } from "#shared/models/db/room/LeaveRoomInput";
import { updateRoomInputSchema } from "#shared/models/db/room/UpdateRoomInput";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { RoomAchievementName } from "@esposter/db-schema";

export const RoomAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Room, {
  [RoomAchievementName.Inviter]: defineAchievementDefinition({
    amount: 1,
    description: "Create an invite link",
    icon: "i-mdi:link-plus",
    inputSchema: createInviteInputSchema,
    points: 10,
    triggerPath: "invite.createInvite",
  }),
  [RoomAchievementName.PartyHost]: defineAchievementDefinition({
    amount: 10,
    description: "Create 10 rooms",
    icon: "i-mdi:party-popper",
    inputSchema: createRoomInputSchema,
    points: 75,
    triggerPath: "room.createRoom",
  }),
  [RoomAchievementName.RoomCreator]: defineAchievementDefinition({
    amount: 1,
    description: "Create your first chat room",
    icon: "i-mdi:forum",
    inputSchema: createRoomInputSchema,
    points: 25,
    triggerPath: "room.createRoom",
  }),
  [RoomAchievementName.RoomDestroyer]: defineAchievementDefinition({
    amount: 1,
    description: "Delete a room",
    icon: "i-mdi:delete-forever",
    inputSchema: deleteRoomInputSchema,
    points: 10,
    triggerPath: "room.deleteRoom",
  }),
  [RoomAchievementName.RoomHopper]: defineAchievementDefinition({
    amount: 20,
    description: "Join 20 rooms",
    icon: "i-mdi:run-fast",
    inputSchema: joinRoomInputSchema,
    points: 60,
    triggerPath: "room.joinRoom",
  }),
  [RoomAchievementName.RoomJoiner]: defineAchievementDefinition({
    amount: 1,
    description: "Join a room",
    icon: "i-mdi:account-arrow-right",
    inputSchema: joinRoomInputSchema,
    points: 10,
    triggerPath: "room.joinRoom",
  }),
  [RoomAchievementName.RoomLeaver]: defineAchievementDefinition({
    amount: 1,
    description: "Leave a room",
    icon: "i-mdi:exit-to-app",
    inputSchema: leaveRoomInputSchema,
    points: 5,
    triggerPath: "room.leaveRoom",
  }),
  [RoomAchievementName.RoomRenovator]: defineAchievementDefinition({
    amount: 1,
    description: "Update a room",
    icon: "i-mdi:home-edit",
    inputSchema: updateRoomInputSchema,
    points: 10,
    triggerPath: "room.updateRoom",
  }),
  [RoomAchievementName.Socialite]: defineAchievementDefinition({
    amount: 5,
    description: "Join 5 different chat rooms",
    icon: "i-mdi:account-group",
    inputSchema: joinRoomInputSchema,
    points: 50,
    triggerPath: "room.joinRoom",
  }),
});
