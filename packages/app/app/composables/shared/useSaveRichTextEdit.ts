import type { Editor } from "@tiptap/core";
import type { SetupContext } from "vue";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { getResultAsync, noop } from "@esposter/shared";

export type SaveRichTextEditEmit = SetupContext<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>["emit"];
// Editing away the last character is how a message or comment is deleted, so an emptied editor hands off to
// Delete mode rather than saving nothing. Leaving edit mode runs on every path, including the failed update, so
// It never depends on the write landing — a rejected save reverts to what is on the server. No finalizer is
// Needed for that: the chain is terminated first, so it resolves rather than rejecting and the lines after the
// Await always run
export const useSaveRichTextEdit = (
  edited: Ref<string>,
  getOriginal: () => string,
  update: () => Promise<unknown>,
  emit: SaveRichTextEditEmit,
) =>
  getSynchronizedFunction(async (editor: Editor) => {
    await getResultAsync(async () => {
      if (edited.value === getOriginal()) return;
      else if (EMPTY_TEXT_REGEX.test(editor.getText())) {
        emit("update:delete-mode", true);
        return;
      }
      await update();
    }).match(noop, console.error);
    emit("update:update-mode", false);
    edited.value = getOriginal();
  });
