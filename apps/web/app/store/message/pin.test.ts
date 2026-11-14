// @vitest-environment nuxt
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { useDataStore } from "@/store/message/data";
import { usePinStore } from "@/store/message/pin";
import { MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePinStore, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const createMessage = () => createOptimisticMessage({ message, roomId, type: MessageType.Message }, userId);

  beforeEach(() => {
    setCurrentRoomId(roomId);
  });

  // The pinned list is maintained off the same update the message list gets, so the entity it lists is the one
  // Already loaded there — a pin of a message the list never held has nothing to show and adds nothing
  test("lists a message the moment it is pinned", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { getSlice } = dataStore;
    const pinStore = usePinStore();
    const { displayMessages } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    getSlice(pinnedMessage.roomId).items.value = [pinnedMessage];
    await MessageHookMap[Operation.Update].run({ id: pinnedMessage.id, isPinned: true, roomId: pinnedMessage.roomId });

    expect(displayMessages.value.map(({ id }) => id)).toStrictEqual([pinnedMessage.id]);
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
    const pinnedMessage = createOptimisticMessage({ message, roomId: otherRoomId, type: MessageType.Message }, userId);
    getDataSlice(otherRoomId).items.value = [pinnedMessage];
    await MessageHookMap[Operation.Update].run({ id: pinnedMessage.id, isPinned: true, roomId: pinnedMessage.roomId });

    expect(getPinSlice(otherRoomId).items.value.map(({ id }) => id)).toStrictEqual([pinnedMessage.id]);
  });

  test("drops a message the moment it is unpinned", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { getSlice } = dataStore;
    const pinStore = usePinStore();
    const { displayMessages } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    getSlice(pinnedMessage.roomId).items.value = [pinnedMessage];
    const pinnedInput = { id: pinnedMessage.id, roomId: pinnedMessage.roomId };
    await MessageHookMap[Operation.Update].run({ ...pinnedInput, isPinned: true });
    // The unpin carries `isPinned: false`, the boolean column's own value, so an unpin the hook can see is never an
    // Absent key
    await MessageHookMap[Operation.Update].run({ ...pinnedInput, isPinned: false });

    expect(displayMessages.value).toStrictEqual([]);
  });
});
