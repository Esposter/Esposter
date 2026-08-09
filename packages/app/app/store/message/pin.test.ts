// @vitest-environment nuxt
import type { Router } from "vue-router";

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { useDataStore } from "@/store/message/data";
import { usePinStore } from "@/store/message/pin";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(usePinStore, () => {
  let router: Router;
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const createMessage = () => createMessageEntity({ message, roomId, type: MessageType.Message, userId });

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
  });

  // The pinned list is maintained off the same update the message list gets, so the entity it lists is the one
  // Already loaded there — a pin of a message the list never held has nothing to show and adds nothing
  test("lists a message the moment it is pinned", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const pinStore = usePinStore();
    const { messages } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    items.value = [pinnedMessage];
    await MessageHookMap[Operation.Update].run({
      isPinned: true,
      partitionKey: pinnedMessage.partitionKey,
      rowKey: pinnedMessage.rowKey,
    });

    expect(messages.value.map(({ rowKey }) => rowKey)).toStrictEqual([pinnedMessage.rowKey]);
  });

  test("drops a message the moment it is unpinned", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const pinStore = usePinStore();
    const { messages } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    items.value = [pinnedMessage];
    const pinnedInput = {
      partitionKey: pinnedMessage.partitionKey,
      rowKey: pinnedMessage.rowKey,
    };
    await MessageHookMap[Operation.Update].run({ ...pinnedInput, isPinned: true });
    // The unpin carries the key holding `undefined`, which is what the server emits — `isPinned` is typed
    // `true | undefined`, so an unpin the hook can see is never a `false` and never an absent key
    await MessageHookMap[Operation.Update].run({ ...pinnedInput, isPinned: undefined });

    expect(messages.value).toStrictEqual([]);
  });
});
