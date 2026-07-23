import type { FileEntity } from "@esposter/db-schema";

import { useDownloadFileStore } from "@/store/message/file";
import { useRoomStore } from "@/store/message/room";

export const useReadFiles = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const downloadFileStore = useDownloadFileStore();
  const { fileUrlMap } = storeToRefs(downloadFileStore);
  const readFileUrls = useReadFileUrls();
  return async (files: FileEntity[]) => {
    if (!currentRoomId.value) return;

    const newFiles = files.filter(({ id }) => !fileUrlMap.value.has(id));
    if (newFiles.length === 0) return;

    const newFileUrlMap = await readFileUrls(newFiles, currentRoomId.value);
    for (const [id, fileUrl] of newFileUrlMap) fileUrlMap.value.set(id, fileUrl);
  };
};
