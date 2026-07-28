import type { ReadFileUrl } from "@/models/message/file/ReadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { getHasThumbnail } from "#shared/services/message/file/getHasThumbnail";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";
import { chunk, getIsServer, getResultAsync, MAX_READ_LIMIT, noop, Operation } from "@esposter/shared";
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
  // The only place read urls are minted and written, so the two rules that make a write correct hold by
  // Construction for every caller instead of once per call site — the invariant was previously restated at
  // Three of them and half-applied at the third.
  // Keyed by the room the files were read FOR, never `fileUrlMap.value`: that resolves to whichever room is
  // Current at the moment it is read, and every caller awaits a network round trip first. A user who switches
  // Rooms during that await would have one room's urls written into another room's map — the room they landed
  // On renders attachments it has no urls for, and the room they left never receives the ones it asked for.
  // Chunked, because a room scrolled back far enough holds more attachments than the query accepts in one input.
  // Which files need urls is the caller's question (a page read wants the ones it lacks, the sweep only the
  // Ones it already holds and are aging out); how they are read and stored is this function's.
  // The chunks cover disjoint sets of file ids and nothing later depends on an earlier one's map, so they go
  // Out together and are merged once every response is in — serialised, the last chunk's images stay broken
  // For as many round-trip latencies as there are chunks. Merging after they all resolve is what keeps the
  // Single read-modify-write of the room map from losing a concurrent chunk's entries.
  const storeReadFileUrls = async (roomId: string, files: FileEntity[], isBackground?: true) => {
    const newFileUrlMaps = await Promise.all(
      chunk(files, MAX_READ_LIMIT).map((fileChunk) => readFileUrls(fileChunk, roomId, isBackground)),
    );
    const roomFileUrlMap = getData(roomId) ?? new Map<string, ReadFileUrl>();
    for (const newFileUrlMap of newFileUrlMaps)
      for (const [id, fileUrl] of newFileUrlMap) roomFileUrlMap.set(id, fileUrl);
    setData(roomId, roomFileUrlMap);
  };
  MessageHookMap[Operation.Create].register(async (message) => {
    const roomId = roomStore.currentRoomId;
    if (!roomId || message.files.length === 0) return;

    await storeReadFileUrls(roomId, message.files);
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
  // Entries, and surfacing an alert for a background re-mint would interrupt a user who lost nothing yet.
  // Swallowing here is not enough on its own, which is why the read is marked background: the room may be one
  // The user was just banned from or removed from, and errorLink navigates to the login page on the FORBIDDEN
  // That comes back — inside the link chain, before the rejection ever reaches this handler to be swallowed
  const refreshExpiringFileUrls = () =>
    getResultAsync(async () => {
      const roomId = roomStore.currentRoomId;
      if (!roomId) return;

      const expiredAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
      const expiringFiles = dataStore.files.filter((file) => {
        const fileUrl = fileUrlMap.value.get(file.id);
        if (!fileUrl) return false;
        else if (fileUrl.expiresAt <= expiredAt) return true;
        // A file that recorded a thumbnail but holds no thumbnail url was only half re-minted: the thumbnail
        // Query resolves to nothing on failure rather than failing the batch the bubble needs. Its original
        // Came back with a full expiry, so without this the entry sits outside the margin for a whole SAS
        // Duration and the room serves multi-megabyte originals until reload. Eligible, it retries next tick.
        else return getHasThumbnail(file) && !fileUrl.thumbnailUrl;
      });
      await storeReadFileUrls(roomId, expiringFiles, true);
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

  return { fileUrlMap, storeReadFileUrls, viewableFiles, viewFiles };
});
