// Bit order is the wire format and is fixed by `apps/web/content/docs/esbabbler/rbac.md`; the sort is
// Disabled because that order, not the alphabet, is the contract. It runs category by category — text channel,
// General, moderation, advanced — and what each bit grants is said once, on the screen that grants it, by
// `apps/web/app/services/message/room/role/RoomPermissionDefinitionMap.ts`.
/* eslint-disable perfectionist/sort-objects */
export const RoomPermission = {
  ReadMessages: 1n << 0n,
  SendMessages: 1n << 1n,
  ManageMessages: 1n << 2n,
  MentionEveryone: 1n << 3n,
  ManageRoom: 1n << 4n,
  ManageRoles: 1n << 5n,
  ManageInvites: 1n << 6n,
  KickMembers: 1n << 7n,
  BanMembers: 1n << 8n,
  MuteMembers: 1n << 9n,
  MoveMembers: 1n << 10n,
  ManageNicknames: 1n << 11n,
  ManageWebhooks: 1n << 12n,
  ManageEmojis: 1n << 13n,
  // Last, and it moves up as the list grows: stored values are read as the current shape rather than migrated,
  // So the bits are free to be the order the list should be in rather than the order it was written in.
  // `permissions` is a signed 64-bit bigint, so bit 62 is the ceiling this can grow to
  Administrator: 1n << 14n,
} as const;
/* eslint-enable perfectionist/sort-objects */

export type RoomPermission = (typeof RoomPermission)[keyof typeof RoomPermission];
