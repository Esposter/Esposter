import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { getEmojiSlug } from "@/services/message/emoji/getEmojiSlug";

// Resolved when a description is read rather than materialised into a map at import, which would force the
// Whole index in on the server too, where nothing renders a tooltip
export const getEmojiDescription = (emoji: string) => {
  const emojiSlug = getEmojiSlug(emoji);
  return getEmojiShortcode(emojiSlug);
};
