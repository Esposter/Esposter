import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { UploadFileUrl } from "@/models/esbabbler/file/UploadFileUrl";

import { MessageHookMap } from "@/services/esbabbler/message/MessageHookMap";
import { createDataMap } from "@/services/shared/createDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useUploadFileStore = defineStore("esbabbler/uploadFile", () => {
  const roomStore = useRoomStore();
  const { data: files } = createDataMap<FileEntity[]>(() => roomStore.currentRoomId, []);
  const { data: fileUrlMap } = createDataMap(() => roomStore.currentRoomId, new Map<string, UploadFileUrl>());
  const isFileLoading = ref(false);
  const removeFileUrl = (id: string) => {
    const uploadFileUrl = fileUrlMap.value.get(id);
    if (!uploadFileUrl) return;

    URL.revokeObjectURL(uploadFileUrl.url);
    fileUrlMap.value.delete(id);
  };
  MessageHookMap.ResetSend.push(() => {
    const savedFiles = files.value;
    files.value = [];
    for (const { id } of savedFiles) removeFileUrl(id);
  });
  return {
    files,
    fileUrlMap,
    isFileLoading,
    removeFileUrl,
  };
});
