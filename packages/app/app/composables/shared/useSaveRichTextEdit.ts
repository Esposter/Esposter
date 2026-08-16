import type { Editor } from "@tiptap/core";
import type { SetupContext } from "vue";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { withFinalizerAsync } from "@esposter/shared";

export type SaveRichTextEditEmit = SetupContext<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>["emit"];
// Editing away the last character is how a message or comment is deleted, so an emptied editor hands off to
// Delete mode rather than saving nothing. The finalizer runs on every path, including the failed update, so
// Leaving edit mode never depends on the write landing — a rejected save reverts to what is on the server
export const useSaveRichTextEdit = (
  edited: Ref<string>,
  getOriginal: () => string,
  update: () => Promise<unknown>,
  emit: SaveRichTextEditEmit,
) =>
  getSynchronizedFunction(async (editor: Editor) => {
    await withFinalizerAsync(
      async () => {
        if (edited.value === getOriginal()) return;
        else if (EMPTY_TEXT_REGEX.test(editor.getText())) {
          emit("update:delete-mode", true);
          return;
        }
        await update();
      },
      () => {
        emit("update:update-mode", false);
        edited.value = getOriginal();
      },
    );
  });
