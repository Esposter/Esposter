// @vitest-environment nuxt
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { MimeType } from "#shared/models/file/MimeType";
import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import MessageRightSideBarThreadIndex from "#src/components/Message/RightSideBar/Thread/Index.vue";
import { goOnline } from "#src/composables/shared/network.test";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useLayoutStore } from "#src/store/layout";
import { useFileStore } from "#src/store/message/file/index";
import { useThreadStore } from "#src/store/message/thread";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getTopic, MessageType, TopicKind } from "@esposter/db-schema";
import { Operation, waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

// The store reaches the layout store, which reads the library's breakpoints — an injection that needs a component
// Instance. Shallow because only the store wiring is under test here, not the drawer's own markup
const mountThreadDrawer = () => mountSuspended(MessageRightSideBarThreadIndex, { shallow: true });

describe(useThreadStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const userId = v7();
  const message = "message";
  const threadRootId = 1;
  const createReply = (replyToId: ClientMessage["id"] | null = null) =>
    createOptimisticMessage({ message, replyToId, roomId, type: MessageType.Message }, userId);
  // A reply the thread read returns is a row the room numbered, where a bubble the sender holds has a negative id
  const roomReplyId = 2;
  const createRoomReply = (replyToId: ClientMessage["id"] | null = null) => ({
    ...createReply(replyToId),
    id: roomReplyId,
  });
  // The read is held in flight until the test resolves it. `readStarted` resolves once the handler has the request, so a
  // Test that acts on the read acts while it is genuinely out rather than before the request has reached the handler
  const holdThreadRead = () => {
    const read = Promise.withResolvers<ClientMessage[]>();
    const readStarted = Promise.withResolvers<void>();
    trpcMsw.message.readThread.query(() => {
      readStarted.resolve();
      return read.promise;
    });
    return { readStarted: readStarted.promise, resolveRead: read.resolve };
  };

  beforeEach(() => {
    // Every read that returns replies reads their authors, the root they quote and their reactions too, which no
    // Test here is about
    trpcMsw.room.readUsersByIds.query(() => []);
    trpcMsw.message.readMessagesByIds.query(() => []);
    trpcMsw.message.emoji.readReactions.query(() => []);
    // Opening a thread loads the follow state of its room, which no test here is about
    trpcMsw.message.readFollowedThreads.query(() => ({ follows: [], threads: [] }));
  });

  test("opens the drawer on the thread it read", async () => {
    expect.hasAssertions();

    const reply = createRoomReply();
    trpcMsw.message.readThread.query(() => [reply]);
    await mountThreadDrawer();
    const layoutStore = useLayoutStore();
    const { isRightDrawerOpen } = storeToRefs(layoutStore);
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    await openThread(roomId, threadRootId);

    expect(threadMessages.value.map(({ id }) => id)).toStrictEqual([reply.id]);
    expect(isRightDrawerOpen.value).toBe(true);
  });

  // The read spans the whole open, so the user can close the drawer while it is still in flight — a response
  // Applied afterwards reopens a drawer they just dismissed, on a thread they are no longer looking at
  test("drops a thread read the user closed while it was loading", async () => {
    expect.hasAssertions();

    const { readStarted, resolveRead } = holdThreadRead();
    await mountThreadDrawer();
    const layoutStore = useLayoutStore();
    const { isRightDrawerOpen } = storeToRefs(layoutStore);
    const threadStore = useThreadStore();
    const { activeRoomId, activeThreadRootId, threadMessages } = storeToRefs(threadStore);
    const { closeThread } = threadStore;
    const openThread = useOpenThread();
    const openPromise = openThread(roomId, threadRootId);
    await readStarted;

    // The click opens the drawer, not the response — a read still in flight has a pane to load into
    expect(isRightDrawerOpen.value).toBe(true);

    closeThread();
    resolveRead([createRoomReply()]);
    await openPromise;

    expect(threadMessages.value).toStrictEqual([]);
    expect(isRightDrawerOpen.value).toBe(false);
    expect(activeRoomId.value).toBe("");
    expect(activeThreadRootId.value).toBe(0);
  });

  // A newer open aborts the read the earlier one still waits on, so the earlier thread's replies never land on the
  // Thread the user opened last, even when that earlier read settles after it
  test("lands only the newest open's replies when an earlier read settles last", async () => {
    expect.hasAssertions();

    const laterThreadRootId = 2;
    const earlierRead = Promise.withResolvers<ClientMessage[]>();
    const laterReply = createRoomReply();
    trpcMsw.message.readThread.query(({ input }) =>
      input.threadRootId === threadRootId ? earlierRead.promise : [laterReply],
    );
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    const earlierOpen = openThread(roomId, threadRootId);
    await openThread(roomId, laterThreadRootId);
    earlierRead.resolve([{ ...createRoomReply(threadRootId), id: 3 }]);
    await earlierOpen;

    expect(threadMessages.value.map(({ id }) => id)).toStrictEqual([laterReply.id]);
  });

  // A reply renders its attachments, the message it quotes and its reactions from the room's metadata, and a thread
  // Can hold replies the room's list never paged to — so the open reads them the way a page read does
  test("reads the metadata of the replies it opens on", async () => {
    expect.hasAssertions();

    const url = "url";
    const file = {
      filename: message,
      hasThumbnail: false,
      id: v7(),
      isSpoiler: false,
      mimetype: MimeType.Png,
      size: 1,
    };
    const reply = {
      ...createOptimisticMessage(
        { files: [file], message, replyToId: threadRootId, roomId, type: MessageType.Message },
        userId,
      ),
      id: roomReplyId,
    };
    trpcMsw.message.readThread.query(() => [reply]);
    trpcMsw.message.generateDownloadFilePresignedUrls.query(() => [url]);
    await mountThreadDrawer();
    const openThread = useOpenThread();
    const fileStore = useFileStore();
    const { getFileUrlMap } = fileStore;
    await openThread(roomId, threadRootId);

    expect(getFileUrlMap(roomId)?.get(file.id)?.url).toBe(url);
  });

  // The pane is a live view rather than the snapshot `readThread` returned — without this a reply lands in the
  // Room list and the thread it belongs to shows nothing, including the sender's own, which is the composer's
  // Entire feedback
  test("shows a reply that lands while the thread is open", async () => {
    expect.hasAssertions();

    trpcMsw.message.readThread.query(() => []);
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    await openThread(roomId, threadRootId);
    const reply = createReply(threadRootId);
    await MessageHookMap[Operation.Create].run(reply);

    expect(threadMessages.value.map(({ id }) => id)).toStrictEqual([reply.id]);
  });

  // The response is a snapshot from before the reply, so assigning it wholesale drops a reply the create hook
  // Already pushed here — and the pane shows nothing of it until the thread is reopened
  test("keeps a reply that landed while the thread read was in flight", async () => {
    expect.hasAssertions();

    const { readStarted, resolveRead } = holdThreadRead();
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    const openPromise = openThread(roomId, threadRootId);
    await readStarted;
    const liveReply = createReply(threadRootId);
    await MessageHookMap[Operation.Create].run(liveReply);
    const readReply = createRoomReply(threadRootId);
    resolveRead([readReply]);
    await openPromise;

    expect(threadMessages.value.map(({ id }) => id)).toStrictEqual([readReply.id, liveReply.id]);
  });

  test("ignores a message that belongs to another thread", async () => {
    expect.hasAssertions();

    trpcMsw.message.readThread.query(() => []);
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    await openThread(roomId, threadRootId);
    await MessageHookMap[Operation.Create].run(createReply(2));

    expect(threadMessages.value).toStrictEqual([]);
  });

  // The thread is named by its root, so a deleted root leaves nothing for the pane to be about — where a
  // Deleted reply merely leaves the thread one message shorter
  test("closes the pane when the root is deleted", async () => {
    expect.hasAssertions();

    trpcMsw.message.readThread.query(() => [createRoomReply(threadRootId)]);
    await mountThreadDrawer();
    const layoutStore = useLayoutStore();
    const { isRightDrawerOpen } = storeToRefs(layoutStore);
    const threadStore = useThreadStore();
    const { activeThreadRootId, threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    await openThread(roomId, threadRootId);
    await MessageHookMap[Operation.Delete].run({ id: threadRootId, roomId });

    expect(activeThreadRootId.value).toBe(0);
    expect(threadMessages.value).toStrictEqual([]);
    expect(isRightDrawerOpen.value).toBe(false);
  });

  // A reply the room takes while the thread is open is a publish of the room's topic, which the read names, so the
  // Thread is read again and the reply lands without a reopen
  test("reads the thread again when a topic its answer names is published", async () => {
    expect.hasAssertions();

    const topic = getTopic(TopicKind.Room, roomId);
    let replies = [createRoomReply()];
    trpcMsw.message.readThread.query(({ ctx }) => {
      ctx.responseHeaders.set(
        TOPICS_HEADER,
        formatTopicsHeaderValue("message.readThread", { readAt: 0, signature: "", topics: [{ topic }] }),
      );
      return replies;
    });
    const connectionStore = useConnectionStore();
    const { openUser } = connectionStore;
    openUser();
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    goOnline();
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    await openThread(roomId, threadRootId);
    const laterReply = { ...createRoomReply(), id: roomReplyId + 1 };
    replies = [createRoomReply(), laterReply];
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();

    expect(threadMessages.value.map(({ id }) => id)).toContain(laterReply.id);
  });
});
