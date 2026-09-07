import { getEmojiCharacterKey } from "@/services/message/emoji/getEmojiCharacterKey";
import { getEmojiIndex } from "@/services/message/emoji/getEmojiIndex";

// A reaction's tag is also its identity — `useSelectEmoji` finds the existing row by matching it — so every
// Form one can arrive in resolves to the same slug before anything is compared: a picked character, a toned
// Variant of it, and a tag already stored as either a glyph or a slug. Nothing is rewritten in the table;
// Only the identity rows are compared on becomes canonical, which is what stops one emoji owning two rows
export const getEmojiSlug = (emoji: string) => {
  const { characterEmojiMap, slugEmojiMap } = getEmojiIndex();
  if (slugEmojiMap.has(emoji)) return emoji;
  return characterEmojiMap.get(getEmojiCharacterKey(emoji))?.slug ?? emoji;
};
