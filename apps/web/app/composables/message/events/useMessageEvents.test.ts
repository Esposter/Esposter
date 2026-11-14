// @vitest-environment nuxt
import type { RoomMessage } from "@esposter/db-schema";

import { useMessageEvents } from "@/composables/message/events/useMessageEvents";
import { openRealtimeSocket } from "@/services/realtime/openRealtimeSocket.test";
import { useDataStore } from "@/store/message/data";
import { useConnectionStore } from "@/store/realtime/connection";
import { MessageType } from "@esposter/db-schema";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/realtime/openRealtimeSocket"), () => import("@/services/realtime/openRealtimeSocket.test"));

// A message as the room's object sends it: its integer id is the room's own, and the room is named by the socket instead
const createRoomMessage = (id: number, message: string): RoomMessage => {
  const now = new Date();
  return {
    appUserId: null,
    createdAt: now,
    files: [],
    id,
    isEdited: false,
    isForward: false,
    isPinned: false,
    linkPreviewResponse: null,
    mentions: [],
    message,
    replyToId: null,
    senderName: null,
    type: MessageType.Message,
    updatedAt: now,
    userId: null,
  };
};

describe(useMessageEvents, () => {
  // A message's id is only the room's own, so a frame lands in the room its socket was opened for, never another
  test("files a created message under the room its socket was opened for, by its integer id", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const otherRoomId = crypto.randomUUID();
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
    const [, onFrame] = vi.mocked(openRealtimeSocket).mock.lastCall ?? [];

    onFrame?.(JSON.stringify({ data: [createRoomMessage(messageId, message)], type: "createMessage" }));
    await flushPromises();

    expect(dataStore.getSlice(roomId).items.value).toHaveLength(0);
    expect(
      dataStore.getSlice(otherRoomId).items.value.map(({ id, roomId: messageRoomId }) => [id, messageRoomId]),
    ).toStrictEqual([[messageId, otherRoomId]]);
    scope.stop();
  });

  test("removes a deleted message from the room its socket was opened for only", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
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
    const [, onFrame] = vi.mocked(openRealtimeSocket).mock.lastCall ?? [];
    onFrame?.(JSON.stringify({ data: [createRoomMessage(messageId, "message")], type: "createMessage" }));
    await flushPromises();

    onFrame?.(JSON.stringify({ data: { id: messageId }, type: "deleteMessage" }));
    await flushPromises();

    expect(dataStore.getSlice(roomId).items.value).toHaveLength(0);
    scope.stop();
  });
});
