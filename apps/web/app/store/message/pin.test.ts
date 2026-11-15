// @vitest-environment nuxt
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { useDataStore } from "#src/store/message/data";
import { usePinStore } from "#src/store/message/pin";
import { MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePinStore, () => {
  const roomId = v7();
  const userId = v7();
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
    const { items } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    getSlice(pinnedMessage.roomId).items.value = [pinnedMessage];
    await MessageHookMap[Operation.Update].run({ id: pinnedMessage.id, isPinned: true, roomId: pinnedMessage.roomId });

    expect(items.value.map(({ id }) => id)).toStrictEqual([pinnedMessage.id]);
  });

  // The room pages its pins newest message first, so a pin takes the place its message has in that order, ahead of the
  // Older pins already listed. Added at the end, it would sit under them until the list is read again
  test("places a pin where the room's page order puts it", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const pinStore = usePinStore();
    const { items } = storeToRefs(pinStore);
    const olderPin = { ...createMessage(), id: 3 };
    const newerMessage = { ...createMessage(), id: 5 };
    pinStore.getSlice(roomId).items.value = [olderPin];
    dataStore.getSlice(roomId).items.value = [newerMessage];
    await MessageHookMap[Operation.Update].run({ id: newerMessage.id, isPinned: true, roomId });

    expect(items.value.map(({ id }) => id)).toStrictEqual([newerMessage.id, olderPin.id]);
  });

  // The pins are listed in the order the room pages them, which an edit does not change, since the order is the room's
  // And not the time of the last change to a message. The edit still reaches the pinned copy
  test("takes an edit to a pinned message without moving it", async () => {
    expect.hasAssertions();

    const pinStore = usePinStore();
    const { items } = storeToRefs(pinStore);
    const newerPin = { ...createMessage(), id: 5 };
    const editedPin = { ...createMessage(), id: 3 };
    pinStore.getSlice(roomId).items.value = [newerPin, editedPin];
    await MessageHookMap[Operation.Update].run({ id: editedPin.id, message: "edited", roomId });

    expect(items.value.map(({ id }) => id)).toStrictEqual([newerPin.id, editedPin.id]);
    expect(items.value[1]?.message).toBe("edited");
  });

  // The pinned list holds its own rows, read past what the room has loaded, so a deletion reaches it through the hook
  test("drops a pinned message the moment it is deleted", async () => {
    expect.hasAssertions();

    const pinStore = usePinStore();
    const { items } = storeToRefs(pinStore);
    const pinnedMessage = { ...createMessage(), id: 3 };
    pinStore.getSlice(roomId).items.value = [pinnedMessage];
    await MessageHookMap[Operation.Delete].run({ id: pinnedMessage.id, roomId });

    expect(items.value).toStrictEqual([]);
  });

  // A pin toggled from a search result or a thread names a room the reader is not in. Read against the room on
  // Screen the source message is not there at all, so the pin found nothing and silently did nothing
  test("pins a message in a room the reader is not currently in", async () => {
    expect.hasAssertions();

    const otherRoomId = v7();
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
    const { items } = storeToRefs(pinStore);
    const pinnedMessage = createMessage();
    getSlice(pinnedMessage.roomId).items.value = [pinnedMessage];
    const pinnedInput = { id: pinnedMessage.id, roomId: pinnedMessage.roomId };
    await MessageHookMap[Operation.Update].run({ ...pinnedInput, isPinned: true });
    // The unpin carries `isPinned: false`, the boolean column's own value, so an unpin the hook can see is never an
    // Absent key
    await MessageHookMap[Operation.Update].run({ ...pinnedInput, isPinned: false });

    expect(items.value).toStrictEqual([]);
  });
});
