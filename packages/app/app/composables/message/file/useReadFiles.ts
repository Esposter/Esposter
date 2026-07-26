import type { FileEntity } from "@esposter/db-schema";

import { useDownloadFileStore } from "@/store/message/file";
import { useRoomStore } from "@/store/message/room";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";

export const useReadFiles = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const downloadFileStore = useDownloadFileStore();
  const { fileUrlMap } = storeToRefs(downloadFileStore);
  const readFileUrls = useReadFileUrls();
  return async (files: FileEntity[]) => {
    if (!currentRoomId.value) return;

    // A url inside the refresh margin is treated as already gone, so nothing is handed to the renderer that
    // Could expire while it is on screen — the store's sweep uses the same margin.
    const expiredAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
    const newFiles = files.filter(({ id }) => {
      const fileUrl = fileUrlMap.value.get(id);
      return !fileUrl || fileUrl.expiresAt <= expiredAt;
    });
    if (newFiles.length === 0) return;

    const newFileUrlMap = await readFileUrls(newFiles, currentRoomId.value);
    for (const [id, fileUrl] of newFileUrlMap) fileUrlMap.value.set(id, fileUrl);
  };
};
