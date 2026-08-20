import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";

export const getEmojiShortcode = (slug: string) => `${SuggestionTrigger.Emoji}${slug}${SuggestionTrigger.Emoji}`;
