import type { FileEntity } from "@esposter/db-schema";

import { useDownloadFileStore } from "@/store/message/file";
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
    for (const [i, { id }] of newFiles.entries()) fileUrlMap.value.set(id, { url: takeOne(downloadFileSasUrls, i) });
  };
};
