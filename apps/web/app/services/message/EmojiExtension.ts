import { createSuggestionExtension } from "#src/services/message/editor/createSuggestionExtension";
import { EmojiSuggestion } from "#src/services/message/emoji/EmojiSuggestion";

export const EmojiExtension = createSuggestionExtension("emoji").configure({ suggestion: EmojiSuggestion });
