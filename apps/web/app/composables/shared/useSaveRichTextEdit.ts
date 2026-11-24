import type { Editor } from "@tiptap/core";
import type { SetupContext } from "vue";

import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";
import { getResultAsync } from "@esposter/shared";

type SaveRichTextEditEmit = SetupContext<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>["emit"];
// Editing away the last character is how a message or comment is deleted, so an emptied editor hands off to Delete mode
// Rather than saving nothing. The editor stays open in a saving state until the write's answer lands: a kept write
// Closes it on the text the answer stored, and a refused one leaves the draft in place, under the alert the write
// Itself raised
export const useSaveRichTextEdit = (
  edited: Ref<string>,
  getOriginal: () => string,
  update: () => Promise<boolean>,
  emit: SaveRichTextEditEmit,
) => {
  const isSaving = ref(false);
  const close = () => {
    emit("update:update-mode", false);
    edited.value = getOriginal();
  };
  const save = async (editor: Editor) => {
    if (isSaving.value) return;

    if (edited.value === getOriginal()) {
      close();
      return;
    }
    if (EMPTY_TEXT_REGEX.test(editor.getText())) {
      emit("update:delete-mode", true);
      close();
      return;
    }

    isSaving.value = true;
    const isKept = await getResultAsync(update).match(
      (isKeptByServer) => isKeptByServer,
      (error) => {
        console.error(error);
        return false;
      },
    );
    isSaving.value = false;
    if (isKept) close();
  };

  return { isSaving, save };
};
