import { getEmojiSlug } from "@/services/message/emoji/getEmojiSlug";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";

// Resolved when a description is read rather than materialised into a map at import, which would force the
// Whole index in on the server too, where nothing renders a tooltip
export const getEmojiDescription = (emoji: string) =>
  `${SuggestionTrigger.Emoji}${getEmojiSlug(emoji)}${SuggestionTrigger.Emoji}`;
