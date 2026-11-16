// @vitest-environment nuxt
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { useForwardStore } from "#src/store/message/input/forward";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useForwardStore, () => {
  // The panel empties as the forward is sent, and the route moves to the destination. A refused forward's rollback has to
  // File the draft under the room it was composed in, not under whichever room is current when the answer lands
  test("a refused forward restores the draft to the room it was sent from, after the route has moved on", () => {
    expect.hasAssertions();

    const sourceRoomId = v7();
    const destinationRoomId = v7();
    setCurrentRoomId(sourceRoomId);
    const forwardStore = useForwardStore();
    const { messageInput, roomIds } = storeToRefs(forwardStore);
    messageInput.value = "composed";
    roomIds.value = [destinationRoomId];

    const restoreForward = forwardStore.takeForward();
    setCurrentRoomId(destinationRoomId);

    expect(messageInput.value).toBe("");
    expect(roomIds.value).toStrictEqual([]);

    restoreForward();
    setCurrentRoomId(sourceRoomId);

    expect(messageInput.value).toBe("composed");
    expect(roomIds.value).toStrictEqual([destinationRoomId]);
  });
});
