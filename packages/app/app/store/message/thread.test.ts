// @vitest-environment nuxt
import type { MessageEntity } from "@esposter/db-schema";

import MessageRightSideBarThreadIndex from "@/components/Message/RightSideBar/Thread/Index.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useLayoutStore } from "@/store/layout";
import { useThreadStore } from "@/store/message/thread";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useThreadStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const rootRowKey = "rootRowKey";
  const createReply = () => createMessageEntity({ message, roomId, type: MessageType.Message, userId });
  // The store reaches the layout store, which resolves Vuetify's display — a composable that needs a component
  // Instance. Shallow because only the store wiring is under test here, not the drawer's own markup
  const mountThreadDrawer = () => mountSuspended(MessageRightSideBarThreadIndex, { shallow: true });

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
    closeThread();
    resolveRead([createReply()]);
    await openPromise;

    expect(threadMessages.value).toStrictEqual([]);
    expect(isRightDrawerOpen.value).toBe(false);
    expect(activeRoomId.value).toBe("");
    expect(activeRootRowKey.value).toBe("");
  });
});
