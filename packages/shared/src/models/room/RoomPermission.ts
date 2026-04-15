/* eslint-disable perfectionist/sort-objects */
export const RoomPermission = {
  ReadMessages: 1n,
  SendMessages: 2n,
  ManageMessages: 4n,
  MentionEveryone: 8n,
  ManageRoom: 16n,
  ManageRoles: 32n,
  ManageInvites: 64n,
  KickMembers: 128n,
  BanMembers: 256n,
  MuteMembers: 512n,
  MoveMembers: 1024n,
  Administrator: 2048n,
} as const;

export type RoomPermission = (typeof RoomPermission)[keyof typeof RoomPermission];
