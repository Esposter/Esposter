import { Suggestion } from "@tiptap/suggestion";
import { Extension } from "@tiptap/vue-3";

// The shell every suggestion extension needs is the same one: an options slot the configure call fills and a
// ProseMirror plugin built from it. What differs between them lives in the suggestion config itself — its
// Trigger character, its renderer, and the unique `PluginKey` ProseMirror requires of each.
export const createSuggestionExtension = (name: string) =>
  Extension.create({
    addOptions() {
      return { suggestion: {} };
    },

    addProseMirrorPlugins() {
      return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
    },

    name,
  });
