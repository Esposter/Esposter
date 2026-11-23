// The bits run by category, the text-channel permissions first and Administrator last, as
// `openspec/specs/esbabbler/rbac/design.md` orders them.
// Adding one mid-list renumbers the bits after it, since a stored bitfield is read as the current shape.
// What each bit grants is said once, on the screen that grants it, by
// `apps/web/app/services/message/room/role/RoomPermissionDefinitionMap.ts`.
/* oxlint-disable sorting/sort-objects -- the list runs by category, not alphabetically */
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
  ManageDisplayNames: 1n << 11n,
  ManageWebhooks: 1n << 12n,
  ManageEmojis: 1n << 13n,
  // `permissions` is a signed 64-bit bigint, so bit 62 is the highest bit the list can grow to
  Administrator: 1n << 14n,
} as const;
/* oxlint-enable sorting/sort-objects */

export type RoomPermission = (typeof RoomPermission)[keyof typeof RoomPermission];
