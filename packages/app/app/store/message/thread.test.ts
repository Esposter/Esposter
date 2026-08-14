// @vitest-environment nuxt
import type { MessageEntity } from "@esposter/db-schema";

import MessageRightSideBarThreadIndex from "@/components/Message/RightSideBar/Thread/Index.vue";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useLayoutStore } from "@/store/layout";
import { useThreadStore } from "@/store/message/thread";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { noop, Operation } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

// The store reaches the layout store, which resolves Vuetify's display — a composable that needs a component
// Instance. Shallow because only the store wiring is under test here, not the drawer's own markup
const mountThreadDrawer = () => mountSuspended(MessageRightSideBarThreadIndex, { shallow: true });

describe(useThreadStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const rootRowKey = "rootRowKey";
  const createReply = (replyRowKey?: string) =>
    createMessageEntity({ message, replyRowKey, roomId, type: MessageType.Message, userId });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("opens the drawer on the thread it read", async () => {
    expect.hasAssertions();

    const reply = createReply();
    server.use(trpcMsw.message.readThread.query(() => [reply]));
    await mountThreadDrawer();
    const layoutStore = useLayoutStore();
    const { isRightDrawerOpen } = storeToRefs(layoutStore);
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const { openThread } = threadStore;
    await openThread(roomId, rootRowKey);

    expect(threadMessages.value.map(({ rowKey }) => rowKey)).toStrictEqual([reply.rowKey]);
    expect(isRightDrawerOpen.value).toBe(true);
  });

  // The read spans the whole open, so the user can close the drawer while it is still in flight — a response
  // Applied afterwards reopens a drawer they just dismissed, on a thread they are no longer looking at
  test("drops a thread read the user closed while it was loading", async () => {
    expect.hasAssertions();

    let resolveRead: (replies: MessageEntity[]) => void = noop;
    // Resolved by the handler itself, so the close lands while the read is genuinely in flight rather than
    // Before the request has even reached it
    const readStarted = new Promise<void>((resolveReadStarted) => {
      server.use(
        trpcMsw.message.readThread.query(
          () =>
            new Promise<MessageEntity[]>((resolve) => {
              resolveRead = resolve;
              resolveReadStarted();
            }),
        ),
      );
    });
    await mountThreadDrawer();
    const layoutStore = useLayoutStore();
    const { isRightDrawerOpen } = storeToRefs(layoutStore);
    const threadStore = useThreadStore();
    const { activeRoomId, activeRootRowKey, threadMessages } = storeToRefs(threadStore);
    const { closeThread, openThread } = threadStore;
    const openPromise = openThread(roomId, rootRowKey);
    await readStarted;

    // The click opens the drawer, not the response — a read still in flight has a pane to load into
    expect(isRightDrawerOpen.value).toBe(true);

    closeThread();
    resolveRead([createReply()]);
    await openPromise;

    expect(threadMessages.value).toStrictEqual([]);
    expect(isRightDrawerOpen.value).toBe(false);
    expect(activeRoomId.value).toBe("");
    expect(activeRootRowKey.value).toBe("");
  });

  // The pane is a live view rather than the snapshot `readThread` returned — without this a reply lands in the
  // Room list and the thread it belongs to shows nothing, including the sender's own, which is the composer's
  // Entire feedback
  test("shows a reply that lands while the thread is open", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.message.readThread.query(() => []));
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const { openThread } = threadStore;
    await openThread(roomId, rootRowKey);
    const reply = createReply(rootRowKey);
    await MessageHookMap[Operation.Create].run(reply);

    expect(threadMessages.value.map(({ rowKey }) => rowKey)).toStrictEqual([reply.rowKey]);
  });

  test("ignores a message that belongs to another thread", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.message.readThread.query(() => []));
    await mountThreadDrawer();
    const threadStore = useThreadStore();
    const { threadMessages } = storeToRefs(threadStore);
    const { openThread } = threadStore;
    await openThread(roomId, rootRowKey);
    await MessageHookMap[Operation.Create].run(createReply("otherRootRowKey"));

    expect(threadMessages.value).toStrictEqual([]);
  });

  // The thread is named by its root, so a deleted root leaves nothing for the pane to be about — where a
  // Deleted reply merely leaves the thread one message shorter
  test("closes the pane when the root is deleted", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.message.readThread.query(() => [createReply(rootRowKey)]));
    await mountThreadDrawer();
    const layoutStore = useLayoutStore();
    const { isRightDrawerOpen } = storeToRefs(layoutStore);
    const threadStore = useThreadStore();
    const { activeRootRowKey, threadMessages } = storeToRefs(threadStore);
    const { openThread } = threadStore;
    await openThread(roomId, rootRowKey);
    await MessageHookMap[Operation.Delete].run({ partitionKey: roomId, rowKey: rootRowKey });

    expect(activeRootRowKey.value).toBe("");
    expect(threadMessages.value).toStrictEqual([]);
    expect(isRightDrawerOpen.value).toBe(false);
  });
});
