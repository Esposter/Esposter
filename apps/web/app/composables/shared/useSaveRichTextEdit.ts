import type { Editor } from "@tiptap/core";
import type { SetupContext } from "vue";

import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";
import { getResult, noop } from "@esposter/shared";

export type SaveRichTextEditEmit = SetupContext<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>["emit"];
// Editing away the last character is how a message or comment is deleted, so an emptied editor hands off to
// Delete mode rather than saving nothing. The update is sent and edit mode ends at once, so the screen never waits on
// The write: a refused write is undone by its own rollback, which puts the stored text back on screen
export const useSaveRichTextEdit =
  (edited: Ref<string>, getOriginal: () => string, update: () => void, emit: SaveRichTextEditEmit) =>
  (editor: Editor) => {
    getResult(() => {
      if (edited.value === getOriginal()) return;
      else if (EMPTY_TEXT_REGEX.test(editor.getText())) emit("update:delete-mode", true);
      else update();
    }).match(noop, console.error);
    emit("update:update-mode", false);
    edited.value = getOriginal();
  };
