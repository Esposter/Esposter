import { SlashCommandSuggestion } from "@/services/message/slashCommands/SlashCommandSuggestion";
import Suggestion from "@tiptap/suggestion";
import { Extension } from "@tiptap/vue-3";

const SlashCommandExtension = Extension.create({
  addOptions() {
    return { suggestion: {} };
  },

  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },

  name: "slashCommand",
});

export const useSlashCommandExtension = () => SlashCommandExtension.configure({ suggestion: SlashCommandSuggestion });
