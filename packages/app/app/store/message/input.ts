import type { Editor } from "@tiptap/core";

import { validateFile } from "@/services/file/validateFile";
import { useRoomStore } from "@/store/message/room";
import { useUploadFileStore } from "@/store/message/uploadFile";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

export const useInputStore = defineStore("message/input", () => {
  const roomStore = useRoomStore();
  const { data: input } = useDataMap(() => roomStore.currentRoomId, "");
  const uploadFileStore = useUploadFileStore();
  const validateInput = (editor?: Editor, isDisplayError?: true) => {
    if (isDisplayError && !uploadFileStore.files.every(({ size }) => validateFile(size))) {
      useEmptyFileAlert();
      return false;
    } else
      return (
        !uploadFileStore.isFileLoading &&
        (Boolean(editor && !EMPTY_TEXT_REGEX.test(editor.getText())) || uploadFileStore.files.length > 0)
      );
  };
  return {
    input,
    validateInput,
  };
});
