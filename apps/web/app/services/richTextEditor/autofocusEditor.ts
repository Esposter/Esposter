import type { Editor, FocusPosition } from "@tiptap/vue-3";

import { checkIsTypingElsewhere } from "@/services/ui/checkIsTypingElsewhere";

// An editor's own autofocus runs on creation whoever holds focus, so it asks here instead, from its `onCreate`, where the
// View is attached: a reader typing somewhere else keeps their keystrokes
export const autofocusEditor = (editor: Editor, position: FocusPosition) => {
  if (!checkIsTypingElsewhere(editor.view.dom)) editor.commands.focus(position);
};
