// @vitest-environment nuxt
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { useForwardStore } from "#src/store/message/input/forward";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useForwardStore, () => {
  // The panel keeps its draft while the forward is out, and empties once the server answers. A refused forward has
  // Nothing to put back, since the draft never left the panel
  test("a forward the server has not answered keeps the draft it was composed in", () => {
    expect.hasAssertions();

    const sourceRoomId = v7();
    const destinationRoomId = v7();
    setCurrentRoomId(sourceRoomId);
    const forwardStore = useForwardStore();
    const { messageInput, roomIds } = storeToRefs(forwardStore);
    messageInput.value = "composed";
    roomIds.value = [destinationRoomId];

    setCurrentRoomId(destinationRoomId);

    expect(messageInput.value).toBe("");
    setCurrentRoomId(sourceRoomId);

    expect(messageInput.value).toBe("composed");
    expect(roomIds.value).toStrictEqual([destinationRoomId]);
  });

  // The answer empties the panel of the room the forward was composed in, even though the route has moved on by then
  test("a sent forward empties the panel of the room it was composed in, after the route has moved on", () => {
    expect.hasAssertions();

    const sourceRoomId = v7();
    const destinationRoomId = v7();
    setCurrentRoomId(sourceRoomId);
    const forwardStore = useForwardStore();
    const { messageInput, roomIds } = storeToRefs(forwardStore);
    messageInput.value = "composed";
    roomIds.value = [destinationRoomId];
    setCurrentRoomId(destinationRoomId);

    forwardStore.clearForward(sourceRoomId, { message: "composed", roomIds: [destinationRoomId] });
    setCurrentRoomId(sourceRoomId);

    expect(messageInput.value).toBe("");
    expect(roomIds.value).toStrictEqual([]);
  });

  // The answer empties only what the forward sent. Text and room picks the reader made while the server had it are the
  // Draft the next forward starts from, so they stay
  test("a sent forward keeps the text and room picks the reader changed while the server had it", () => {
    expect.hasAssertions();

    const sourceRoomId = v7();
    const sentRoomId = v7();
    const pickedRoomId = v7();
    setCurrentRoomId(sourceRoomId);
    const forwardStore = useForwardStore();
    const { messageInput, roomIds } = storeToRefs(forwardStore);
    messageInput.value = "a";
    roomIds.value = [sentRoomId];
    messageInput.value = "ab";
    roomIds.value = [pickedRoomId];

    forwardStore.clearForward(sourceRoomId, { message: "a", roomIds: [sentRoomId] });

    expect(messageInput.value).toBe("ab");
    expect(roomIds.value).toStrictEqual([pickedRoomId]);
  });
});
