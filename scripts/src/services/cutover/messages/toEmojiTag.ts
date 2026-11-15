import { LEGACY_EMOJI_SHORT_NAMES } from "#src/services/cutover/messages/constants";
import { emojiTagSchema } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A legacy reaction's tag as a room's object stores it: a `:short_name:` resolved to its emoji, and a tag that is already
// One kept. An unlisted name fails the copy rather than reaching the room as a reaction nobody can render
export const toEmojiTag = (legacyEmojiTag: string): string => {
  const shortName = /^:(?<name>[^:]+):$/u.exec(legacyEmojiTag)?.groups?.name;
  const emojiTag = shortName === undefined ? legacyEmojiTag : LEGACY_EMOJI_SHORT_NAMES[shortName];
  if (emojiTag === undefined || !emojiTagSchema.safeParse(emojiTag).success)
    throw new InvalidOperationError(Operation.Read, toEmojiTag.name, legacyEmojiTag);
  return emojiTag;
};
