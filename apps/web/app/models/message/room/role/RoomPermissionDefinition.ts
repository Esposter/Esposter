export const RoomPermissionDefinition = {
  Administrator: "Administrator",
  BanMembers: "BanMembers",
  KickMembers: "KickMembers",
  ManageDisplayNames: "ManageDisplayNames",
  ManageEmojis: "ManageEmojis",
  ManageInvites: "ManageInvites",
  ManageMessages: "ManageMessages",
  ManageRoles: "ManageRoles",
  ManageRoom: "ManageRoom",
  ManageWebhooks: "ManageWebhooks",
  MentionEveryone: "MentionEveryone",
  MoveMembers: "MoveMembers",
  MuteMembers: "MuteMembers",
  ReadMessages: "ReadMessages",
  SendMessages: "SendMessages",
} as const;
export type RoomPermissionDefinition = (typeof RoomPermissionDefinition)[keyof typeof RoomPermissionDefinition];
