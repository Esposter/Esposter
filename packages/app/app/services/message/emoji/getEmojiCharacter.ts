import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";

// An `emojiTag` is a slug, but the column is an unvalidated string that has also held raw glyphs, so a tag
// The index does not know renders as itself rather than as nothing
export const getEmojiCharacter = (emojiTag: string) => getEmojiIndex().bySlug.get(emojiTag)?.character ?? emojiTag;
