import type { SuggestionList } from "#src/models/message/SuggestionList";
import type { RichTextSuggestion } from "#src/models/richTextEditor/RichTextSuggestion";

// The one suggestion open, since a reader has one caret. The suggestion plugin writes it and the editor it belongs to
// Draws it, inside that editor's own tree; the list drawn registers itself so the plugin can hand it the keys
export const useRichTextSuggestionStore = defineStore("richTextEditor/suggestion", () => {
  const suggestion = shallowRef<RichTextSuggestion>();
  const list = shallowRef<SuggestionList>();
  return { list, suggestion };
});
