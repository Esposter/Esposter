import type { FileEntity, RoomInMessage } from "@esposter/db-schema";

import { useFileStore } from "@/store/message/file";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";

export const useReadFiles = () => {
  const fileStore = useFileStore();
  const { fileUrlMap } = storeToRefs(fileStore);
  const { readFileUrls } = fileStore;
  return async (roomId: RoomInMessage["id"], files: FileEntity[]) => {
    // A url inside the refresh margin is treated as already gone, so nothing is handed to the renderer that
    // Could expire while it is on screen — the store's sweep uses the same margin.
    const expiringAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
    const newFiles = files.filter(({ id }) => {
      const fileUrl = fileUrlMap.value.get(id);
      return !fileUrl || fileUrl.expiresAt <= expiringAt;
    });
    if (newFiles.length === 0) return;

    await readFileUrls(roomId, newFiles);
  };
};
