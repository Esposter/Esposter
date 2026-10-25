import type { Editor } from "@tiptap/core";
import type { SuggestionProps } from "@tiptap/suggestion";

export interface RichTextSuggestion {
  component: Component;
  // The editor whose caret it completes, so only that editor's host draws it
  editor: Editor;
  // Where the caret is now, which moves as the reader types
  getRect: () => DOMRect | undefined;
  // What the suggestion plugin hands the list: its items, its query and the command that takes one, without the rect it positions by
  props: Omit<SuggestionProps, "clientRect">;
}
