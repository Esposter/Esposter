// @vitest-environment nuxt
import type { Router } from "vue-router";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { getMockSession } from "@@/server/trpc/context.test";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
// AuthClient is a better-auth dynamic-path Proxy, so useSession is not a configurable own property and
// Cannot be spied on directly — mock the module and drive useSession through a hoisted mock instead. The
// Store reads only session.value.data.user.id, so the mock returns just that slice of the session ref.
interface MockSessionValue {
  data?: { user: { id: string } };
}
const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<() => Ref<MockSessionValue>>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe(useDataStore, () => {
  const server = setupMswTrpc();
  let router: Router;
  const roomId = crypto.randomUUID();
  const message = "message";
  const updatedMessage = "updatedMessage";

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: undefined }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("storeCreateMessage is idempotent", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { storeCreateMessage } = dataStore;
    const newMessage = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: getMockSession().user.id,
    });
    // The onCreateMessage subscription echoes to the sender for isSendToSelf sends (forward, pin) and on
    // WebPubSub reconnect, so applying the same message twice must not duplicate the list entry.
    await storeCreateMessage(newMessage);
    await storeCreateMessage(newMessage);

    expect(items.value).toHaveLength(1);
  });

  test("createMessage rolls back the optimistic message when the Create hook rejects", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    // CreateMessage reads only session.value.data.user.id off the reactive session
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { createMessage } = dataStore;
    // A Create hook fetches attachment download URLs over the network; a rejection there must roll the
    // Optimistically-rendered bubble back out instead of leaving a permanent loading entity in the list.
    vi.spyOn(MessageHookMap[Operation.Create], "run").mockRejectedValueOnce(new Error(message));
    const isCreated = await createMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(isCreated).toBe(false);
    expect(items.value).toHaveLength(0);
  });

  // The mutation spans the server commit, so a rejection can equally be a lost response for a message that
  // Landed. Deleting the bubble then hides a sent message from its own sender — the subscription echo is
  // Filtered for the sending session — and invites the duplicate resend persist-then-notify exists to prevent
  test("createMessage keeps the optimistic message when the mutation rejects", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { createMessage } = dataStore;
    server.use(
      trpcMsw.message.createMessage.mutation(() => {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message });
      }),
    );
    const isCreated = await createMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(isCreated).toBe(false);
    expect(items.value).toHaveLength(1);
  });

  // The reset clears the editor, the reply target and the composer's attachments, so the bubble is the sender's
  // Only copy of what they typed — a send that fails before the bubble exists must leave the composer alone
  test("storeSendMessage resets the composer only once the optimistic message is in the list", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const dataStore = useDataStore();
    const { storeSendMessage } = dataStore;
    vi.spyOn(MessageHookMap[Operation.Create], "run").mockRejectedValueOnce(new Error(message));
    const resetSendSpy = vi.spyOn(MessageHookMap.ResetSend, "run");
    await storeSendMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(resetSendSpy).not.toHaveBeenCalled();
  });

  // A successful create also mirrors the server's thread auto-follow, so the reply's root is followed locally
  // Without the round trip the drawer would otherwise need
  test("createMessage mirrors the thread auto-follow of a reply", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const dataStore = useDataStore();
    const threadFollowStore = useThreadFollowStore();
    const { createMessage } = dataStore;
    const replyRowKey = crypto.randomUUID();
    server.use(
      trpcMsw.message.createMessage.mutation(() =>
        createMessageEntity({ message, roomId, type: MessageType.Message, userId }),
      ),
    );
    const isCreated = await createMessage({ files: [], message, replyRowKey, roomId, type: MessageType.Message });

    expect(isCreated).toBe(true);
    expect(threadFollowStore.checkIsFollowing(roomId, replyRowKey)).toBe(true);
  });

  // Only the sender's own message renders ahead of its hooks — it has a loading bubble to keep responsive and a
  // Rollback if they reject. A message from anyone else waits, or every incoming attachment renders broken until
  // Its url fetch lands
  test("withholds a message from another member until its Create hooks resolve", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { storeCreateMessage } = dataStore;
    const newMessage = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: crypto.randomUUID(),
    });
    vi.spyOn(MessageHookMap[Operation.Create], "run").mockResolvedValue();
    const storePromise = storeCreateMessage(newMessage);

    // Synchronously after the call the hooks are still pending, so nothing may have been pushed yet
    expect(items.value).toHaveLength(0);

    await storePromise;

    expect(items.value).toHaveLength(1);
  });

  test("storeUpdateMessage is idempotent", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { storeCreateMessage, storeUpdateMessage } = dataStore;
    const newMessage = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: getMockSession().user.id,
    });
    await storeCreateMessage(newMessage);
    const updatedInput = { message: updatedMessage, partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    await storeUpdateMessage(updatedInput);
    await storeUpdateMessage(updatedInput);

    expect(items.value).toHaveLength(1);
    expect(takeOne(items.value).message).toBe(updatedMessage);
  });

  test("storeDeleteMessage is idempotent", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { storeCreateMessage, storeDeleteMessage } = dataStore;
    const newMessage = createMessageEntity({
      message,
      roomId,
      type: MessageType.Message,
      userId: getMockSession().user.id,
    });
    await storeCreateMessage(newMessage);
    const deleteInput = { partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey };
    await storeDeleteMessage(deleteInput);
    await storeDeleteMessage(deleteInput);

    expect(items.value).toHaveLength(0);
  });
});
