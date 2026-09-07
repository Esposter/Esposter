import type { ReadFileUrl } from "@/models/message/file/ReadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { checkHasThumbnail } from "@/services/message/file/checkHasThumbnail";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";
import { checkIsServer, chunk, getResultAsync, MAX_READ_LIMIT, noop, Operation } from "@esposter/shared";

export const useFileStore = defineStore("message/file", () => {
  const roomStore = useRoomStore();
  const dataStore = useDataStore();
  const baseReadFileUrls = useReadFileUrls();
  const {
    data: fileUrlMap,
    getData,
    setData,
  } = useDataMap(() => roomStore.currentRoomId, new Map<string, ReadFileUrl>());
  // The only place read urls are minted and written, so the two rules that make a write correct hold by
  // Construction for every caller instead of once per call site.
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
  const readFileUrls = async (roomId: string, files: FileEntity[]) => {
    const newFileUrlMaps = await Promise.all(
      chunk(files, MAX_READ_LIMIT).map((fileChunk) => baseReadFileUrls(fileChunk, roomId)),
    );
    const roomFileUrlMap = getData(roomId) ?? new Map<string, ReadFileUrl>();
    for (const newFileUrlMap of newFileUrlMaps)
      for (const [id, fileUrl] of newFileUrlMap) roomFileUrlMap.set(id, fileUrl);
    setData(roomId, roomFileUrlMap);
  };
  // The room the message was sent to, never the current one: a subscription handler is queued behind the ones
  // Before it, so a message that arrives just before a room switch is handled after `currentRoomId` has already
  // Moved on. Read against the wrong room the SAS query names file ids that room does not own, so it rejects
  // And every attachment on that message renders broken.
  MessageHookMap[Operation.Create].register(async ({ files, partitionKey }) => {
    if (files.length === 0) return;

    await readFileUrls(partitionKey, files);
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
  // Entries. What the user sees of it is the error link's to decide, not this store's — a code the link owns is
  // Alerted there, once, however many of the batch's reads that one cause rejected. What being marked background
  // Inside `useReadFileUrls` buys is that a rejection for a room the user was just removed from cannot MOVE
  // Them — that happens inside the link chain, before the rejection ever arrives here to be swallowed.
  const refreshExpiringFileUrls = () =>
    getResultAsync(async () => {
      const roomId = roomStore.currentRoomId;
      if (!roomId) return;

      const expiringAt = Date.now() + READ_SAS_REFRESH_INTERVAL_MS;
      const expiringFiles = dataStore.files.filter((file) => {
        const fileUrl = fileUrlMap.value.get(file.id);
        if (!fileUrl) return false;
        else if (fileUrl.expiresAt <= expiringAt) return true;
        // A file that recorded a thumbnail but holds no thumbnail url was only half re-minted: the thumbnail
        // Query resolves to nothing on failure rather than failing the batch the bubble needs. Its original
        // Came back with a full expiry, so without this the entry sits outside the margin for a whole SAS
        // Duration and the room serves multi-megabyte originals until reload. Eligible, it retries next tick.
        else return checkHasThumbnail(file) && !fileUrl.thumbnailUrl;
      });
      await readFileUrls(roomId, expiringFiles);
    }).match(noop, console.error);
  // The server renders once and discards the store, so the timer would only ever be a leak there.
  if (!checkIsServer()) useIntervalFn(getSynchronizedFunction(refreshExpiringFileUrls), READ_SAS_REFRESH_INTERVAL_MS);

  // The gallery the viewer walks: everything that has something to look at and a url to look at it through. A PDF
  // Opens its own dialog from its own renderer and audio plays from the row, so pulling either in would mean two
  // Dialogs racing for one click
  const viewableFiles = computed(() => {
    const files: Pick<FileEntity, "filename" | "id" | "mimetype">[] = [];
    for (const { filename, id, mimetype } of dataStore.files) {
      if (!fileUrlMap.value.has(id)) continue;
      const inferredMimetype = getInferredMimetype(mimetype);
      if (inferredMimetype !== "image" && inferredMimetype !== "video") continue;
      files.push({ filename, id, mimetype });
    }
    return files;
  });

  return { fileUrlMap, readFileUrls, viewableFiles };
});
