import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { UploadFileUrl } from "@/models/esbabbler/file/UploadFileUrl";

import { MessageHookMap } from "@/services/esbabbler/message/MessageHookMap";
import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const { data: messageInput } = createDataMap(() => roomStore.currentRoomId, "");
  const replyRowKey = ref<string>();
  MessageHookMap.ResetSend.push(() => (replyRowKey.value = undefined));

  const { data: files } = createDataMap<FileEntity[]>(() => roomStore.currentRoomId, []);
  const { data: uploadFileUrlMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, UploadFileUrl>());
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
  return {
    files,
    forwardRoomIds,
    forwardRowKey,
    messageInput,
    removeFileUrl,
    replyRowKey,
    uploadFileUrlMap,
  };
});
