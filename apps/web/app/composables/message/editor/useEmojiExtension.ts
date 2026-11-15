import { createSuggestionExtension } from "#src/services/message/editor/createSuggestionExtension";
import { EmojiSuggestion } from "#src/services/message/emoji/EmojiSuggestion";

const EmojiExtension = createSuggestionExtension("emoji");

export const useEmojiExtension = () => EmojiExtension.configure({ suggestion: EmojiSuggestion });
