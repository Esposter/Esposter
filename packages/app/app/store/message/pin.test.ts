// @vitest-environment nuxt

import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { useDataStore } from "@/store/message/data";
import { usePinStore } from "@/store/message/pin";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePinStore, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const createMessage = () => createMessageEntity({ message, roomId, type: MessageType.Message, userId });

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(roomId);
  });

  // The pinned list is maintained off the same update the message list gets, so the entity it lists is the one
  // Already loaded there — a pin of a message the list never held has nothing to show and adds nothing
  test("lists a message the moment it is pinned", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { getSlice } = dataStore;
    const pinStore = usePinStore();
    const { messages } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    getSlice(pinnedMessage.partitionKey).items.value = [pinnedMessage];
    await MessageHookMap[Operation.Update].run({
      isPinned: true,
      partitionKey: pinnedMessage.partitionKey,
      rowKey: pinnedMessage.rowKey,
    });

    expect(messages.value.map(({ rowKey }) => rowKey)).toStrictEqual([pinnedMessage.rowKey]);
  });

  // A pin toggled from a search result or a thread names a room the reader is not in. Read against the room on
  // Screen the source message is not there at all, so the pin found nothing and silently did nothing
  test("pins a message in a room the reader is not currently in", async () => {
    expect.hasAssertions();

    const otherRoomId = crypto.randomUUID();
    const dataStore = useDataStore();
    const { getSlice: getDataSlice } = dataStore;
    const pinStore = usePinStore();
    const { getSlice: getPinSlice } = pinStore;
    const pinnedMessage = createMessageEntity({ message, roomId: otherRoomId, type: MessageType.Message, userId });
    getDataSlice(otherRoomId).items.value = [pinnedMessage];
    await MessageHookMap[Operation.Update].run({
      isPinned: true,
      partitionKey: pinnedMessage.partitionKey,
      rowKey: pinnedMessage.rowKey,
    });

    expect(getPinSlice(otherRoomId).items.value.map(({ rowKey }) => rowKey)).toStrictEqual([pinnedMessage.rowKey]);
  });

  test("drops a message the moment it is unpinned", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { getSlice } = dataStore;
    const pinStore = usePinStore();
    const { messages } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    getSlice(pinnedMessage.partitionKey).items.value = [pinnedMessage];
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
