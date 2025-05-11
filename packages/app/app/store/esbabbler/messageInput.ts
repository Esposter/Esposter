import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { UploadFileUrl } from "@/models/esbabbler/file/UploadFileUrl";

import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMessageInputStore = defineStore("esbabbler/messageInput", () => {
  const roomStore = useRoomStore();
  const { data: messageInput } = createDataMap(() => roomStore.currentRoomId, "");
  const { data: files } = createDataMap<FileEntity[]>(() => roomStore.currentRoomId, []);
  const { data: uploadFileUrlMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, UploadFileUrl>());
  const replyRowKey = ref<string>();
  const forwardRowKey = ref<string>();
  const forwardRoomIds = ref<string[]>([]);
  return {
    files,
    forwardRoomIds,
    forwardRowKey,
    messageInput,
    replyRowKey,
    uploadFileUrlMap,
  };
});
