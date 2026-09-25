import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

// A reaction row belongs to every member on it at once, so which write a member makes depends on whether anyone
// Else is: the only reactor takes the whole row away, and everyone else toggles themself on or off it
export const checkIsOnlyReactor = (userIds: MessageEmojiMetadataEntity["userIds"], userId: string) =>
  userIds.length === 1 && userIds[0] === userId;
