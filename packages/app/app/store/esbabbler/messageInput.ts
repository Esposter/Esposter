import type { Editor } from "@tiptap/core";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";
import { useUploadFileStore } from "@/store/esbabbler/uploadFile";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const { data: messageInput } = createDataMap(() => roomStore.currentRoomId, "");
  const uploadFileStore = useUploadFileStore();
  const validateMessageInput = (editor?: Editor, isDisplayError?: true) => {
    if (isDisplayError && !uploadFileStore.files.every(({ size }) => uploadFileStore.validateFile(size))) {
      useToast(`You can only upload non-empty files!`, { cardProps: { color: "error" } });
      return false;
    } else
      return (
        !uploadFileStore.isFileLoading &&
        (Boolean(editor && !EMPTY_TEXT_REGEX.test(editor.getText())) || uploadFileStore.files.length > 0)
      );
  };
  return {
    messageInput,
    validateMessageInput,
  };
});
