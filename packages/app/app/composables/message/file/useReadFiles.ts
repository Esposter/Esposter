import type { FileEntity } from "@esposter/db-schema";

import { useFileStore } from "@/store/message/file";
import { useRoomStore } from "@/store/message/room";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";

export const useReadFiles = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const fileStore = useFileStore();
  const { fileUrlMap } = storeToRefs(fileStore);
  return async (files: FileEntity[]) => {
    const roomId = currentRoomId.value;
    if (!roomId) return;
    // A url inside the refresh margin is treated as already gone, so nothing is handed to the renderer that
    // Could expire while it is on screen — the store's sweep uses the same margin.
    const expiredAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
    const newFiles = files.filter(({ id }) => {
      const fileUrl = fileUrlMap.value.get(id);
      return !fileUrl || fileUrl.expiresAt <= expiredAt;
    });
    if (newFiles.length === 0) return;

    await fileStore.readFileUrls(roomId, newFiles);
  };
};
