// @vitest-environment nuxt
import type { Router } from "vue-router";

import { authClient } from "@/services/auth/authClient";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { getMockSession } from "@@/server/trpc/context.test";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

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
    vi.spyOn(authClient, "useSession").mockReturnValue(
      ref({ data: { user: { id: userId } } }) as unknown as ReturnType<typeof authClient.useSession>,
    );
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
