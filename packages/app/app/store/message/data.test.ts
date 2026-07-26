// @vitest-environment nuxt
import type { Router } from "vue-router";

import { mockTrpcProcedure } from "#shared/test/mockTrpcClient";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { useThreadFollowStore } from "@/store/message/threadFollow";
import { getMockSession } from "@@/server/trpc/context.test";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
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
    const created = await createMessage({ files: [], message, replyRowKey: "", roomId, type: MessageType.Message });

    expect(created).toBe(false);
    expect(items.value).toHaveLength(0);
  });

  // The crossing of two features: the optimistic bubble rolls back on failure, and a successful create also
  // Runs local bookkeeping (thread auto-follow). Once the mutation resolves the message exists on the server,
  // And the sender's own subscription echo is filtered out — so a rollback past that point hides a sent
  // Message from the only person who cannot get it back, and invites them to send a duplicate.
  test("createMessage keeps the message when a step after the mutation rejects", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { createMessage } = dataStore;
    mockTrpcProcedure("message.createMessage.mutate").mockResolvedValueOnce({});
    vi.spyOn(useThreadFollowStore(), "storeFollowThread").mockImplementationOnce(() => {
      throw new Error(message);
    });
    const created = await createMessage({
      files: [],
      message,
      replyRowKey: crypto.randomUUID(),
      roomId,
      type: MessageType.Message,
    });

    expect(created).toBe(true);
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
