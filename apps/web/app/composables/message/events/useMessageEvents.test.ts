// @vitest-environment nuxt
import { createRoomMessage } from "#server/services/message/createRoomMessage.test";
import { useMessageEvents } from "#src/composables/message/events/useMessageEvents";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useDataStore } from "#src/store/message/data";
import { useConnectionStore } from "#src/store/realtime/connection";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useMessageEvents, () => {
  const { trpcMsw } = setupMswTrpc();

  // A message's id is only the room's own, so a frame lands in the room its socket was opened for, never another
  test("files a created message under the room its socket was opened for, by its integer id", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const otherRoomId = v7();
    const messageId = 1;
    const message = "message";
    const scope = effectScope();
    scope.run(() => {
      useMessageEvents();
    });
    const connectionStore = useConnectionStore();
    const dataStore = useDataStore();
    await connectionStore.openRoom(
      otherRoomId,
      () => undefined,
      () => undefined,
    );
    const [, onFrame] = getLastOpenRealtimeSocketCall();

    onFrame?.(JSON.stringify({ data: [createRoomMessage({ id: messageId, message })], type: "createMessage" }));
    await flushPromises();

    expect(dataStore.getSlice(roomId).items.value).toHaveLength(0);
    expect(
      dataStore.getSlice(otherRoomId).items.value.map(({ id, roomId: messageRoomId }) => [id, messageRoomId]),
    ).toStrictEqual([[messageId, otherRoomId]]);
    scope.stop();
  });

  test("removes a deleted message from the room its socket was opened for", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const messageId = 1;
    const scope = effectScope();
    scope.run(() => {
      useMessageEvents();
    });
    const connectionStore = useConnectionStore();
    const dataStore = useDataStore();
    await connectionStore.openRoom(
      roomId,
      () => undefined,
      () => undefined,
    );
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    onFrame?.(
      JSON.stringify({ data: [createRoomMessage({ id: messageId, message: "message" })], type: "createMessage" }),
    );
    await flushPromises();

    expect(dataStore.getSlice(roomId).items.value.map(({ id }) => id)).toStrictEqual([messageId]);
    onFrame?.(
      JSON.stringify({
        data: { ...createRoomMessage({ id: messageId, message: "message" }), deletedAt: new Date(0) },
        type: "deleteMessage",
      }),
    );
    await flushPromises();

    expect(dataStore.getSlice(roomId).items.value).toHaveLength(0);
    scope.stop();
  });

  // The author is not a member the room has returned, so the frame's author lookup reaches the room and fails. A failed
  // Lookup only leaves that author unnamed, so the message still lands in the list
  test("lands a message whose author lookup fails in the room its socket was opened for", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const messageId = 1;
    trpcMsw.room.readUsersByIds.query(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const scope = effectScope();
    scope.run(() => {
      useMessageEvents();
    });
    const connectionStore = useConnectionStore();
    const dataStore = useDataStore();
    await connectionStore.openRoom(
      roomId,
      () => undefined,
      () => undefined,
    );
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    onFrame?.(
      JSON.stringify({
        data: [{ ...createRoomMessage({ id: messageId, message: "message" }), userId: v7() }],
        type: "createMessage",
      }),
    );
    await waitForSynchronizedFunctions();

    expect(dataStore.getSlice(roomId).items.value.map(({ id }) => id)).toStrictEqual([messageId]);
    scope.stop();
  });
});
