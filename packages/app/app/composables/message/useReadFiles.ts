import type { FileEntity } from "@esposter/db-schema";

import { useDownloadFileStore } from "@/store/message/downloadFile";
import { useRoomStore } from "@/store/message/room";
import { takeOne } from "@esposter/shared";

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
    for (let i = 0; i < newFiles.length; i++)
      fileUrlMap.value.set(takeOne(newFiles, i).id, { url: takeOne(downloadFileSasUrls, i) });
  };
};
