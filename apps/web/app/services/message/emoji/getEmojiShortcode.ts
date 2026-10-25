import { SuggestionTrigger } from "@/models/shared/SuggestionTrigger";

export const getEmojiShortcode = (slug: string) => `${SuggestionTrigger.Emoji}${slug}${SuggestionTrigger.Emoji}`;
