import type { Editor } from "@tiptap/core";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";
import { useUploadFileStore } from "@/store/esbabbler/uploadFile";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const { data: messageInput } = createDataMap(() => roomStore.currentRoomId, "");
  const uploadFileStore = useUploadFileStore();
  const validateMessageInput = (editor?: Editor) =>
    !uploadFileStore.isFileLoading &&
    (Boolean(editor && !EMPTY_TEXT_REGEX.test(editor.getText())) || uploadFileStore.files.length > 0);
  return {
    messageInput,
    validateMessageInput,
  };
});
