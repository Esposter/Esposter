import type { ReadFileUrl } from "@/models/message/file/ReadFileUrl";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";
import { getIsServer, getResultAsync, MAX_READ_LIMIT, noop, Operation } from "@esposter/shared";
import { api as viewerApi } from "v-viewer";

export const useDownloadFileStore = defineStore("message/file", () => {
  const roomStore = useRoomStore();
  const dataStore = useDataStore();
  const readFileUrls = useReadFileUrls();
  const {
    data: fileUrlMap,
    getData,
    setData,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, ReadFileUrl>());
  // Keyed by the room the urls were read FOR, never `fileUrlMap.value` — that resolves to whichever room is
  // Current at the moment it is read, and every caller here awaits a network round trip first. A user who
  // Switches rooms during that await would have one room's urls written into another room's map: the room they
  // Landed on renders attachments it has no urls for, and the room they left never receives the ones it asked for
  const storeFileUrls = (roomId: string, newFileUrlMap: Map<string, ReadFileUrl>) => {
    const roomFileUrlMap = getData(roomId) ?? new Map<string, ReadFileUrl>();
    for (const [id, fileUrl] of newFileUrlMap) roomFileUrlMap.set(id, fileUrl);
    setData(roomId, roomFileUrlMap);
  };
  MessageHookMap[Operation.Create].register(async (message) => {
    const roomId = roomStore.currentRoomId;
    if (!roomId || message.files.length === 0) return;

    storeFileUrls(roomId, await readFileUrls(message.files, roomId));
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
  // A sweep that rejects is never retried by anything, so it swallows: the next tick re-reads the same expiring
  // Entries, and surfacing an alert for a background re-mint would interrupt a user who lost nothing yet
  const refreshExpiringFileUrls = () =>
    getResultAsync(async () => {
      const roomId = roomStore.currentRoomId;
      if (!roomId) return;

      const expiredAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
      const expiringFiles = dataStore.files.filter(({ id }) => {
        const fileUrl = fileUrlMap.value.get(id);
        return fileUrl && fileUrl.expiresAt <= expiredAt;
      });
      // A room scrolled back far enough holds more attachments than the query accepts in one input, and it is
      // The long-open room — the only one this sweep exists for — that gets there first
      for (let index = 0; index < expiringFiles.length; index += MAX_READ_LIMIT)
        storeFileUrls(roomId, await readFileUrls(expiringFiles.slice(index, index + MAX_READ_LIMIT), roomId));
    }).match(noop, console.error);
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

  return { fileUrlMap, storeFileUrls, viewableFiles, viewFiles };
});
