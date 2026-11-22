// @vitest-environment nuxt
import { createMessage } from "#src/services/message/message/createMessage.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useForwardStore } from "#src/store/message/input/forward";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useForwardStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const composedMessage = "composed";

  // The panel keeps its draft while the forward is out, and empties once the server answers. A refused forward has
  // Nothing to put back, since the draft never left the panel
  test("a forward the server has not answered keeps the draft it was composed in", () => {
    expect.hasAssertions();

    const sourceRoomId = v7();
    const destinationRoomId = v7();
    setRouteId(sourceRoomId);
    const forwardStore = useForwardStore();
    const { messageInput, roomIds } = storeToRefs(forwardStore);
    messageInput.value = composedMessage;
    roomIds.value = [destinationRoomId];

    setRouteId(destinationRoomId);

    expect(messageInput.value).toBe("");
    setRouteId(sourceRoomId);

    expect(messageInput.value).toBe(composedMessage);
    expect(roomIds.value).toStrictEqual([destinationRoomId]);
  });

  // The answer empties the panel of the room the forward was composed in, even though the route has moved on by then
  test("a sent forward empties the panel of the room it was composed in, after the route has moved on", () => {
    expect.hasAssertions();

    const sourceRoomId = v7();
    const destinationRoomId = v7();
    setRouteId(sourceRoomId);
    const forwardStore = useForwardStore();
    const { clearForward } = forwardStore;
    const { messageInput, roomIds } = storeToRefs(forwardStore);
    messageInput.value = composedMessage;
    roomIds.value = [destinationRoomId];
    setRouteId(destinationRoomId);

    clearForward(sourceRoomId, { message: composedMessage, roomIds: [destinationRoomId] });
    setRouteId(sourceRoomId);

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
    setRouteId(sourceRoomId);
    const forwardStore = useForwardStore();
    const { clearForward } = forwardStore;
    const { messageInput, roomIds } = storeToRefs(forwardStore);
    messageInput.value = "a";
    roomIds.value = [sentRoomId];
    messageInput.value = "ab";
    roomIds.value = [pickedRoomId];

    clearForward(sourceRoomId, { message: "a", roomIds: [sentRoomId] });

    expect(messageInput.value).toBe("ab");
    expect(roomIds.value).toStrictEqual([pickedRoomId]);
  });

  // The panel's forward is one write, so the store drops a send made while the one before it is out, from whichever dialog
  // Asks, and the server receives the forward once
  test("drops a send made while the forward for its panel is out", async () => {
    expect.hasAssertions();

    const sourceRoomId = v7();
    const destinationRoomId = v7();
    setRouteId(sourceRoomId);
    let sendCount = 0;
    const { promise: isAnswered, resolve: answerForward } = Promise.withResolvers<void>();
    trpcMsw.message.forwardMessage.mutation(() => {
      sendCount += 1;
      return isAnswered;
    });
    const forwardStore = useForwardStore();
    const { sendForward } = forwardStore;
    const forward = createMessage(sourceRoomId, "<p>a</p>");
    const draft = { message: "a", roomIds: [destinationRoomId] };
    const firstSend = sendForward(sourceRoomId, forward, draft);
    const secondSend = sendForward(sourceRoomId, forward, draft);
    answerForward();
    await Promise.all([firstSend, secondSend]);

    expect(sendCount).toBe(1);
  });
});
