import type { FileEntity } from "#shared/models/azure/FileEntity";

import { useMessageStore } from "@/store/esbabbler/message";
import { useRoomStore } from "@/store/esbabbler/room";

export const useReadFiles = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const messageStore = useMessageStore();
  const { downloadFileUrlMap } = storeToRefs(messageStore);
  return async (files: FileEntity[]) => {
    if (!currentRoomId.value) return;

    const newFiles = files.filter(({ id }) => !downloadFileUrlMap.value.has(id));
    if (newFiles.length === 0) return;

    const downloadFileSasUrls = await $trpc.message.generateDownloadFileSasUrls.query({
      files: newFiles,
      roomId: currentRoomId.value,
    });
    for (let i = 0; i < newFiles.length; i++)
      downloadFileUrlMap.value.set(newFiles[i].id, { url: downloadFileSasUrls[i] });
  };
};
