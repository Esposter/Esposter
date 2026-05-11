import { EmojiSuggestion } from "@/services/message/emoji/EmojiSuggestion";
import { Suggestion } from "@tiptap/suggestion";
import { Extension } from "@tiptap/vue-3";

const EmojiExtension = Extension.create({
  addOptions() {
    return { suggestion: {} };
  },

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },

  name: "emoji",
});

export const useEmojiExtension = () => EmojiExtension.configure({ suggestion: EmojiSuggestion });
