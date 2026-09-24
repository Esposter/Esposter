import type { SuggestionList } from "@/models/message/SuggestionList";
import type { Editor } from "@tiptap/core";

interface RichTextSuggestion {
  component: Component;
  // The editor whose caret it completes, so only that editor's host draws it
  editor: Editor;
  // Where the caret is now, which moves as the reader types
  getRect: () => DOMRect | null;
  // What the suggestion plugin hands the list: its items, its query and the command that takes one
  props: object;
}

// The one suggestion open, since a reader has one caret. The suggestion plugin writes it and the editor it belongs to
// Draws it, inside that editor's own tree; the list drawn registers itself so the plugin can hand it the keys
export const useRichTextSuggestionStore = defineStore("richTextEditor/suggestion", () => {
  const suggestion = shallowRef<RichTextSuggestion>();
  const list = shallowRef<SuggestionList>();
  return { list, suggestion };
});
