// @vitest-environment nuxt

import { MimeType } from "#shared/models/file/MimeType";
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { useFileStore } from "@/store/message/file";
import { useThreadStore } from "@/store/message/thread";
import { createMessageEntity, MessageType, READ_SAS_REFRESH_INTERVAL_MS } from "@esposter/db-schema";
import { MAX_READ_LIMIT, Operation, takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useFileStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const fileId = crypto.randomUUID();
  const filename = "a";
  const staleUrl = "staleUrl";
  const freshUrl = "freshUrl";

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(roomId);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // A page read only mints urls for files it does not already hold, so nothing else re-mints a cached one.
  // Without this sweep a room left open past READ_SAS_DURATION_MS renders every attachment broken until
  // Reload — the failure the expiry check alone was assumed, wrongly, to cover.
  test("re-mints a cached url that has aged into the refresh margin", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.message.generateDownloadFileSasUrls.query(() => [freshUrl]));
    vi.useFakeTimers();
    const dataStore = useDataStore();
    const fileStore = useFileStore();
    const { fileUrlMap } = storeToRefs(fileStore);
    const { getSlice } = dataStore;
    getSlice(roomId).items.value.push(
      createMessageEntity({
        files: [{ filename, hasThumbnail: false, id: fileId, mimetype: MimeType.PlainText, size: 1 }],
        message: filename,
        roomId,
        type: MessageType.Message,
        userId: crypto.randomUUID(),
      }),
    );
    // Inside the margin, so the very next sweep must replace it rather than wait for it to actually die.
    fileUrlMap.value.set(fileId, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS / 2, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);
    // The sweep is fire-and-forget, so drain it rather than polling for its effect.
    await waitForSynchronizedFunctions();

    expect(fileUrlMap.value.get(fileId)?.url).toBe(freshUrl);
  });

  // The viewer walks this list, so what it holds is what a click can open — filtering video out with the
  // Documents leaves a video card bound to no click at all
  test("gathers the media a viewer can open, and nothing it cannot", () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const fileStore = useFileStore();
    const { fileUrlMap } = storeToRefs(fileStore);
    const { getViewableFiles } = fileStore;
    const { getSlice } = dataStore;
    const files = [
      { mimetype: MimeType.Png, name: "image" },
      { mimetype: "video/mp4", name: "video" },
      { mimetype: MimeType.Pdf, name: "document" },
      { mimetype: "audio/mpeg", name: "audio" },
    ].map(({ mimetype, name }) => ({
      filename: name,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      mimetype,
      size: 1,
    }));
    getSlice(roomId).items.value.push(
      createMessageEntity({ files, message: filename, roomId, type: MessageType.Message, userId: crypto.randomUUID() }),
    );
    for (const { id } of files) fileUrlMap.value.set(id, { expiresAt: Date.now(), url: freshUrl });

    expect(getViewableFiles(roomId).map(({ filename: name }) => name)).toStrictEqual(["image", "video"]);
  });

  // A card is only clickable once its url is in hand, so a file still waiting on the batched read is not yet
  // Something the viewer can be opened over
  test("holds back a file whose url has not landed", () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const fileStore = useFileStore();
    const { getViewableFiles } = fileStore;
    const { getSlice } = dataStore;
    getSlice(roomId).items.value.push(
      createMessageEntity({
        files: [{ filename, hasThumbnail: false, id: fileId, mimetype: MimeType.Png, size: 1 }],
        message: filename,
        roomId,
        type: MessageType.Message,
        userId: crypto.randomUUID(),
      }),
    );

    expect(getViewableFiles(roomId)).toStrictEqual([]);
  });

  // The thread pane can hold another room's replies beside the room on screen, and a reply the room's list has
  // Not paged to is still one the viewer opens over — so the gallery is the thread's room's, pane included
  test("gathers the thread pane's media under the thread's own room", async () => {
    expect.hasAssertions();

    const fileStore = useFileStore();
    const { getFileUrlMap, getViewableFiles, readFileUrls } = fileStore;
    const threadStore = useThreadStore();
    const { activeRoomId, threadMessages } = storeToRefs(threadStore);
    const file = { filename, hasThumbnail: false, id: fileId, mimetype: MimeType.Png, size: 1 };
    activeRoomId.value = otherRoomId;
    threadMessages.value = [
      createMessageEntity({
        files: [file],
        message: filename,
        roomId: otherRoomId,
        type: MessageType.Message,
        userId: crypto.randomUUID(),
      }),
    ];
    server.use(trpcMsw.message.generateDownloadFileSasUrls.query(() => [freshUrl]));

    await readFileUrls(otherRoomId, [file]);

    expect(getFileUrlMap(otherRoomId)?.get(fileId)?.url).toBe(freshUrl);
    expect(getViewableFiles(otherRoomId).map(({ id }) => id)).toStrictEqual([fileId]);
    expect(getViewableFiles(roomId)).toStrictEqual([]);
  });

  // The query caps `files` at MAX_READ_LIMIT, and the long-open room this sweep exists for is exactly the one
  // That scrolls past that cap — sending them all in one input would reject every tick from then on
  test("re-mints in batches when more urls expire than one query accepts", async () => {
    expect.hasAssertions();

    const generateDownloadFileSasUrls = vi.fn<(options: { input: { files: unknown[] } }) => string[]>(({ input }) =>
      input.files.map(() => freshUrl),
    );
    server.use(trpcMsw.message.generateDownloadFileSasUrls.query(generateDownloadFileSasUrls));
    vi.useFakeTimers();
    const dataStore = useDataStore();
    const fileStore = useFileStore();
    const { fileUrlMap } = storeToRefs(fileStore);
    const { getSlice } = dataStore;
    const files = Array.from({ length: MAX_READ_LIMIT + 1 }, () => ({
      filename,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      mimetype: MimeType.PlainText,
      size: 1,
    }));
    getSlice(roomId).items.value.push(
      createMessageEntity({ files, message: filename, roomId, type: MessageType.Message, userId: crypto.randomUUID() }),
    );
    for (const { id } of files)
      fileUrlMap.value.set(id, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS / 2, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);
    await waitForSynchronizedFunctions();

    expect(generateDownloadFileSasUrls).toHaveBeenCalledTimes(2);

    expect(fileUrlMap.value.get(takeOne(files, MAX_READ_LIMIT).id)?.url).toBe(freshUrl);
  });

  // A subscription handler is queued behind the ones before it, so a message that arrives just before a room
  // Switch is handled once the current room already names the next one. Read against that room the SAS query
  // Names file ids it does not own and is rejected, leaving every attachment on the message broken.
  test("mints an incoming message's urls under the room it was sent to", async () => {
    expect.hasAssertions();

    const queriedRoomIds: string[] = [];
    server.use(
      trpcMsw.message.generateDownloadFileSasUrls.query(({ input }) => {
        queriedRoomIds.push(input.roomId);
        return [freshUrl];
      }),
    );
    useFileStore();
    await MessageHookMap[Operation.Create].run(
      createMessageEntity({
        files: [{ filename, hasThumbnail: false, id: fileId, mimetype: MimeType.PlainText, size: 1 }],
        message: filename,
        roomId: otherRoomId,
        type: MessageType.Message,
        userId: crypto.randomUUID(),
      }),
    );

    expect(queriedRoomIds).toContain(otherRoomId);
  });

  // A rolled-back send is deleted after the Create hook's await, by which time the reader can be in another room —
  // Read against that room the message is not found and its urls outlive it, re-signed by every sweep
  test("drops a deleted message's urls from the room the message was in", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const fileStore = useFileStore();
    const { fileUrlMap } = storeToRefs(fileStore);
    const { getSlice } = dataStore;
    const message = createMessageEntity({
      files: [{ filename, hasThumbnail: false, id: fileId, mimetype: MimeType.PlainText, size: 1 }],
      message: filename,
      roomId,
      type: MessageType.Message,
      userId: crypto.randomUUID(),
    });
    getSlice(roomId).items.value.push(message);
    fileUrlMap.value.set(fileId, { expiresAt: Date.now(), url: freshUrl });
    setCurrentRoomId(otherRoomId);
    await MessageHookMap[Operation.Delete].run(message);
    setCurrentRoomId(roomId);

    expect(fileUrlMap.value.has(fileId)).toBe(false);
  });

  test("issues no query while every cached url is comfortably valid", async () => {
    expect.hasAssertions();

    const generateDownloadFileSasUrls = vi.fn<() => string[]>(() => [freshUrl]);
    server.use(trpcMsw.message.generateDownloadFileSasUrls.query(generateDownloadFileSasUrls));
    vi.useFakeTimers();
    const fileStore = useFileStore();
    const { fileUrlMap } = storeToRefs(fileStore);
    fileUrlMap.value.set(fileId, { expiresAt: Date.now() + READ_SAS_REFRESH_INTERVAL_MS * 10, url: staleUrl });
    await vi.advanceTimersByTimeAsync(READ_SAS_REFRESH_INTERVAL_MS);

    expect(generateDownloadFileSasUrls).not.toHaveBeenCalled();
  });
});
