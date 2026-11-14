// @vitest-environment nuxt
import type { ClientMessage } from "@/models/message/ClientMessage";

import { MimeType } from "#shared/models/file/MimeType";
import MessageRightSideBarThreadIndex from "@/components/Message/RightSideBar/Thread/Index.vue";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useLayoutStore } from "@/store/layout";
import { useFileStore } from "@/store/message/file";
import { useThreadStore } from "@/store/message/thread";
import { MessageType } from "@esposter/db-schema";
import { noop, Operation } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

// The store reaches the layout store, which reads the library's breakpoints — an injection that needs a component
// Instance. Shallow because only the store wiring is under test here, not the drawer's own markup
const mountThreadDrawer = () => mountSuspended(MessageRightSideBarThreadIndex, { shallow: true });

describe(useThreadStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const userId = v7();
  const message = "message";
  const threadRootId = v7();
  const createReply = (replyToId: null | ClientMessage["id"] = null) =>
    createOptimisticMessage({ message, replyToId, roomId, type: MessageType.Message }, userId);

  beforeEach(() => {
    // Every read that returns replies reads their authors, the root they quote and their reactions too, which no
    // Test here is about
    trpcMsw.room.readUsersByIds.query(() => []);
    trpcMsw.message.readMessagesByIds.query(() => []);
    trpcMsw.message.emoji.readEmojis.query(() => []);
  });

  test("opens the drawer on the thread it read", async () => {
    expect.hasAssertions();

    const reply = createReply();
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

    let resolveRead: (replies: ClientMessage[]) => void = noop;
    // Resolved by the handler itself, so the close lands while the read is genuinely in flight rather than
    // Before the request has even reached it
    const readStarted = new Promise<void>((resolveReadStarted) => {
      trpcMsw.message.readThread.query(
        () =>
          new Promise<ClientMessage[]>((resolve) => {
            resolveRead = resolve;
            resolveReadStarted();
          }),
      );
    });
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
    resolveRead([createReply()]);
    await openPromise;

    expect(threadMessages.value).toStrictEqual([]);
    expect(isRightDrawerOpen.value).toBe(false);
    expect(activeRoomId.value).toBe("");
    expect(activeThreadRootId.value).toBe("");
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
    const reply = createOptimisticMessage(
      { files: [file], message, replyToId: threadRootId, roomId, type: MessageType.Message },
      userId,
    );
    trpcMsw.message.readThread.query(() => [reply]);
    trpcMsw.message.generateDownloadFileSasUrls.query(() => [url]);
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

    let resolveRead: (replies: ClientMessage[]) => void = noop;
    const readStarted = new Promise<void>((resolveReadStarted) => {
      trpcMsw.message.readThread.query(
        () =>
          new Promise<ClientMessage[]>((resolve) => {
            resolveRead = resolve;
            resolveReadStarted();
          }),
      );
    });
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    const openPromise = openThread(roomId, threadRootId);
    await readStarted;
    const liveReply = createReply(threadRootId);
    await MessageHookMap[Operation.Create].run(liveReply);
    const readReply = createReply(threadRootId);
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
    await MessageHookMap[Operation.Create].run(createReply(v7()));

    expect(threadMessages.value).toStrictEqual([]);
  });

  // The thread is named by its root, so a deleted root leaves nothing for the pane to be about — where a
  // Deleted reply merely leaves the thread one message shorter
  test("closes the pane when the root is deleted", async () => {
    expect.hasAssertions();

    trpcMsw.message.readThread.query(() => [createReply(threadRootId)]);
    await mountThreadDrawer();
    const layoutStore = useLayoutStore();
    const { isRightDrawerOpen } = storeToRefs(layoutStore);
    const threadStore = useThreadStore();
    const { activeThreadRootId, threadMessages } = storeToRefs(threadStore);
    const openThread = useOpenThread();
    await openThread(roomId, threadRootId);
    await MessageHookMap[Operation.Delete].run({ id: threadRootId, roomId });

    expect(activeThreadRootId.value).toBe("");
    expect(threadMessages.value).toStrictEqual([]);
    expect(isRightDrawerOpen.value).toBe(false);
  });
});
