import type { ReadFileUrl } from "@/models/message/file/ReadFileUrl";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";
import { getIsServer, Operation } from "@esposter/shared";
import { api as viewerApi } from "v-viewer";

export const useDownloadFileStore = defineStore("message/file", () => {
  const roomStore = useRoomStore();
  const dataStore = useDataStore();
  const readFileUrls = useReadFileUrls();
  const { data: fileUrlMap } = useDataMap(() => roomStore.currentRoomId, new Map<string, ReadFileUrl>());
  MessageHookMap[Operation.Create].register(async (message) => {
    if (!roomStore.currentRoomId || message.files.length === 0) return;

    const newFileUrlMap = await readFileUrls(message.files, roomStore.currentRoomId);
    for (const [id, fileUrl] of newFileUrlMap) fileUrlMap.value.set(id, fileUrl);
  });
  MessageHookMap[Operation.Delete].register((input) => {
    const message = dataStore.items.find(({ rowKey }) => rowKey === input.rowKey);
    if (!message) return;
    for (const { id } of message.files) fileUrlMap.value.delete(id);
  });

  // Read SAS urls expire, and the only other thing that mints them is a page read — which skips every file it
  // Already holds a url for. A room left open past the SAS duration would therefore render every attachment
  // Broken and fail every download until reload. Sweeping re-mints only the entries inside the refresh margin;
  // A tick that finds none issues no query at all, which is the overwhelmingly common case.
  const refreshExpiringFileUrls = async () => {
    const roomId = roomStore.currentRoomId;
    if (!roomId) return;

    const expiredAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
    const expiringFiles = dataStore.files.filter(({ id }) => {
      const fileUrl = fileUrlMap.value.get(id);
      return fileUrl && fileUrl.expiresAt <= expiredAt;
    });
    if (expiringFiles.length === 0) return;

    const newFileUrlMap = await readFileUrls(expiringFiles, roomId);
    for (const [id, fileUrl] of newFileUrlMap) fileUrlMap.value.set(id, fileUrl);
  };
  // The server renders once and discards the store, so the timer would only ever be a leak there.
  if (!getIsServer()) useIntervalFn(getSynchronizedFunction(refreshExpiringFileUrls), READ_SAS_REFRESH_INTERVAL_MS);

  const viewableFiles = computed(() => {
    const viewerImages: { alt: string; id: string; src: string }[] = [];
    for (const { filename, id, mimetype } of dataStore.files) {
      const fileUrl = fileUrlMap.value.get(id);
      if (!fileUrl) continue;
      const inferredMimetype = getInferredMimetype(mimetype);
      if (inferredMimetype !== "image") continue;
      viewerImages.push({ alt: filename, id, src: fileUrl.url });
    }
    return viewerImages;
  });
  const viewFiles = (initialViewIndex: number) => {
    viewerApi({ images: viewableFiles.value, options: { initialViewIndex } });
  };

  return { fileUrlMap, viewableFiles, viewFiles };
});
