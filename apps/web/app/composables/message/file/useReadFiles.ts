import type { FileEntity, RoomInMessage } from "@esposter/db-schema";

import { useFileStore } from "@/store/message/file";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";

export const useReadFiles = () => {
  // Read through the store rather than destructured: the file store reads the thread store, whose setup reaches
  // Here, so when the file store is the one being set up this is still the partial store holding no functions
  const fileStore = useFileStore();
  return async (roomId: RoomInMessage["id"], files: FileEntity[]) => {
    // A url inside the refresh margin is treated as already gone, so nothing is handed to the renderer that
    // Could expire while it is on screen — the store's sweep uses the same margin.
    const expiringAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
    const newFiles = files.filter(({ id }) => {
      // The room the files were read for, never the one on screen: a thread pane shows another room's messages
      const fileUrl = fileStore.getFileUrlMap(roomId)?.get(id);
      return !fileUrl || fileUrl.expiresAt <= expiringAt;
    });
    if (newFiles.length === 0) return;

    await fileStore.readFileUrls(roomId, newFiles);
  };
};
