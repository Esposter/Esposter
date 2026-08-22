import { CUSTOM_EMOJI_TAG_PREFIX } from "#shared/services/message/emoji/constants";

// Which emoji a stored reaction names, or nothing at all for the unicode tags that are the majority — the
// Prefix is the only thing that distinguishes the two, because a character sequence can never contain a colon
export const parseCustomEmojiId = (emojiTag: string) =>
  emojiTag.startsWith(CUSTOM_EMOJI_TAG_PREFIX) ? emojiTag.slice(CUSTOM_EMOJI_TAG_PREFIX.length) : undefined;
