import { SPOILER_ATTRIBUTE } from "@esposter/shared";
import { Mark, markInputRule, mergeAttributes } from "@tiptap/vue-3";

// A mark over text a reader must click to read. Typing `||text||` marks the text as the closing bars are typed,
// and Ctrl+Shift+S toggles the mark over the selection. The mark carries no attributes: the reveal is client
// State, so nothing about it is written into the message
const SpoilerMark = Mark.create({
  addInputRules() {
    return [markInputRule({ find: /\|\|([^|]+)\|\|$/u, type: this.type })];
  },

  addKeyboardShortcuts() {
    return { "Mod-Shift-s": () => this.editor.commands.toggleMark(this.name) };
  },

  name: "spoiler",

  parseHTML() {
    return [{ tag: `span[${SPOILER_ATTRIBUTE}]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { [SPOILER_ATTRIBUTE]: "" }), 0];
  },
});

export const useSpoilerExtension = () => SpoilerMark;
