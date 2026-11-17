import { SPOILER_ATTRIBUTE } from "@esposter/shared";
import { Mark, markInputRule, mergeAttributes } from "@tiptap/vue-3";

// A mark over text a reader must click to read. Typing `||text||` marks the text as the closing bars are typed,
// And Ctrl+Shift+S toggles the mark over the selection. The mark carries no attributes: the reveal is client
// State, so nothing about it is written into the message
// Ctrl+Shift+S is also strikethrough's own key, which this keymap wins in the composer, so strikethrough moves to
// Ctrl+Shift+X, the key chat composers give it
export const SpoilerExtension = Mark.create({
  addInputRules() {
    return [markInputRule({ find: /\|\|(?<text>[^|]+)\|\|$/u, type: this.type })];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor.commands.toggleMark(this.name),
      "Mod-Shift-x": () => this.editor.commands.toggleStrike(),
    };
  },

  name: "spoiler",

  parseHTML() {
    return [{ tag: `span[${SPOILER_ATTRIBUTE}]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { [SPOILER_ATTRIBUTE]: "" }), 0];
  },
});
