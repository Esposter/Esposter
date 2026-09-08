import { createSuggestionExtension } from "@/services/message/editor/createSuggestionExtension";
import { EmojiSuggestion } from "@/services/message/emoji/EmojiSuggestion";

const EmojiExtension = createSuggestionExtension("emoji");

export const useEmojiExtension = () => EmojiExtension.configure({ suggestion: EmojiSuggestion });
