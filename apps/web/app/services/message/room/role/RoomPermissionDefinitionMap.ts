import { RoomPermissionCategory } from "@/models/message/room/role/RoomPermissionCategory";
import { RoomPermission } from "@esposter/db-schema";
// What a bit grants, said to the person deciding whether to grant it. The enum key is what a permission is
// Called; nothing about `ManageMessages` says it reaches other people's messages, which is the whole question
// Someone has when they hover the switch. Exhaustive by type, so a new bit cannot reach the screen without one
export const RoomPermissionDefinitionMap = {
  Administrator: {
    category: RoomPermissionCategory.Advanced,
    description: "Grants every permission and bypasses the role hierarchy. Owners keep this over anyone who has it.",
  },
  BanMembers: { category: RoomPermissionCategory.Moderation, description: "Ban a member from the room permanently." },
  KickMembers: {
    category: RoomPermissionCategory.Moderation,
    description: "Remove a member from the room. They can rejoin with a new invite.",
  },
  ManageEmojis: {
    category: RoomPermissionCategory.Advanced,
    description: "Add, rename and delete the room's custom emoji.",
  },
  ManageInvites: { category: RoomPermissionCategory.General, description: "Create and revoke invite links." },
  ManageMessages: {
    category: RoomPermissionCategory.TextChannel,
    description: "Delete and pin messages written by anyone, not only their own.",
  },
  ManageNicknames: {
    category: RoomPermissionCategory.Moderation,
    description: "Change what other members are called in this room.",
  },
  ManageRoles: {
    category: RoomPermissionCategory.General,
    description: "Create, edit and delete roles below their own highest role.",
  },
  ManageRoom: { category: RoomPermissionCategory.General, description: "Edit the room's name, image and settings." },
  ManageWebhooks: {
    category: RoomPermissionCategory.Advanced,
    description: "Create, edit and delete the webhooks that post into this room.",
  },
  MentionEveryone: {
    category: RoomPermissionCategory.TextChannel,
    description: "Use @everyone and @here, which notify every member.",
  },
  MoveMembers: { category: RoomPermissionCategory.Moderation, description: "Disconnect a member from a call." },
  MuteMembers: { category: RoomPermissionCategory.Moderation, description: "Mute and unmute members in a call." },
  ReadMessages: {
    category: RoomPermissionCategory.TextChannel,
    description: "See the room and read its message history.",
  },
  SendMessages: { category: RoomPermissionCategory.TextChannel, description: "Post messages in the room." },
} as const satisfies Record<keyof typeof RoomPermission, { category: RoomPermissionCategory; description: string }>;
