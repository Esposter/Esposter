import type { FileEntity } from "#shared/models/azure/FileEntity";

import { useDownloadFileStore } from "@/store/message/downloadFile";
import { useRoomStore } from "@/store/message/room";

export const useReadFiles = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const downloadFileStore = useDownloadFileStore();
  const { fileUrlMap } = storeToRefs(downloadFileStore);
  return async (files: FileEntity[]) => {
    if (!currentRoomId.value) return;

    const newFiles = files.filter(({ id }) => !fileUrlMap.value.has(id));
    if (newFiles.length === 0) return;

    const downloadFileSasUrls = await $trpc.message.generateDownloadFileSasUrls.query({
      files: newFiles.map(({ filename, id, mimetype }) => ({ filename, id, mimetype })),
      roomId: currentRoomId.value,
    });
    for (let i = 0; i < newFiles.length; i++) fileUrlMap.value.set(newFiles[i].id, { url: downloadFileSasUrls[i] });
  };
};
