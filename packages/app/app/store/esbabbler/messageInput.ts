import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { UploadFileUrl } from "@/models/esbabbler/file/UploadFileUrl";
import type { Editor } from "@tiptap/core";

import { MessageHookMap } from "@/services/esbabbler/message/MessageHookMap";
import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const { data: messageInput } = createDataMap(() => roomStore.currentRoomId, "");
  const replyRowKey = ref<string>();
  MessageHookMap.ResetSend.push(() => {
    replyRowKey.value = undefined;
  });

  const { data: files } = createDataMap<FileEntity[]>(() => roomStore.currentRoomId, []);
  const { data: uploadFileUrlMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, UploadFileUrl>());
  const isFileLoading = ref(false);
  const getIsSendEnabled = (editor?: Editor) =>
    !isFileLoading.value && (Boolean(editor && !EMPTY_TEXT_REGEX.test(editor.getText())) || files.value.length > 0);
  const removeFileUrl = (id: string) => {
    const uploadFileUrl = uploadFileUrlMap.value.get(id);
    if (!uploadFileUrl) return;

    URL.revokeObjectURL(uploadFileUrl.url);
    uploadFileUrlMap.value.delete(id);
  };
  MessageHookMap.ResetSend.push(() => {
    const savedFiles = files.value;
    files.value = [];
    for (const { id } of savedFiles) removeFileUrl(id);
  });

  const forwardRowKey = ref<string>();
  const forwardRoomIds = ref<string[]>([]);
  const { data: forwardMessageInput } = createDataMap(() => roomStore.currentRoomId, "");

  return {
    files,
    forwardMessageInput,
    forwardRoomIds,
    forwardRowKey,
    getIsSendEnabled,
    isFileLoading,
    messageInput,
    removeFileUrl,
    replyRowKey,
    uploadFileUrlMap,
  };
});
