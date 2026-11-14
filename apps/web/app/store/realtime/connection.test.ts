// @vitest-environment nuxt
import type { RoomMessage, Topic } from "@esposter/db-schema";

import { createId } from "#shared/util/math/random/createId";
import { openRealtimeSocket, sendRealtimeFrame } from "@/services/realtime/openRealtimeSocket.test";
import { useConnectionStore } from "@/store/realtime/connection";
import { CALL_ID_LENGTH, MessageType } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/realtime/openRealtimeSocket"), () => import("@/services/realtime/openRealtimeSocket.test"));

describe(useConnectionStore, () => {
  // A knock opens its call's socket and the admission that follows opens the same call again. The socket it holds is
  // Reused, so the admitted knocker is not reconnected to the call it was already listening to
  test("opens a call's socket once when the same call is opened again", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const callSessionId = createId(CALL_ID_LENGTH);
    await connectionStore.openCall(callSessionId);
    await connectionStore.openCall(callSessionId);

    expect(openRealtimeSocket).toHaveBeenCalledTimes(1);
  });

  // A room's frame reaches its handler with the room its socket was opened for, since a message is named by its room and
  // Its integer id and the frame names neither
  test("dispatches a room frame to the handlers of its type with the room the socket was opened for", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    const roomId = v7();
    const handler = vi.fn<(data: unknown, roomId: string) => void>();
    connectionStore.onRoomEvent("deleteMessage", handler);
    await connectionStore.openRoom(
      roomId,
      () => undefined,
      () => undefined,
    );
    const [, onFrame] = vi.mocked(openRealtimeSocket).mock.lastCall ?? [];

    const createdAt = new Date(0);
    const message: RoomMessage = {
      appUserId: null,
      appUserImage: "",
      createdAt,
      deletedAt: createdAt,
      files: [],
      id: 1,
      isEdited: false,
      isForward: false,
      isPinned: false,
      linkPreviewResponse: null,
      mentions: [],
      message: "",
      replyToId: null,
      senderName: null,
      type: MessageType.Message,
      updatedAt: createdAt,
      userId: null,
    };
    onFrame?.(JSON.stringify({ data: message, type: "deleteMessage" }));

    expect(handler).toHaveBeenCalledExactlyOnceWith(message, roomId);
  });

  // A topic is watched up the user socket once however many queries read it, an invalidation refetches each of them,
  // And the last query to unmount unwatches it
  test("watches a topic once for every query on it, refetches each on its invalidation, and unwatches after the last", () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const [, onFrame] = vi.mocked(openRealtimeSocket).mock.lastCall ?? [];
    const topic: Topic = `post:${v7()}`;
    const firstRefetch = vi.fn<() => void>();
    const secondRefetch = vi.fn<() => void>();
    const unwatchFirst = connectionStore.watchTopics([topic], firstRefetch);
    const unwatchSecond = connectionStore.watchTopics([topic], secondRefetch);
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    unwatchFirst();
    unwatchSecond();

    expect(firstRefetch).toHaveBeenCalledTimes(1);
    expect(secondRefetch).toHaveBeenCalledTimes(1);
    expect(sendRealtimeFrame.mock.calls.map(([frame]) => jsonDateParse(frame))).toStrictEqual([
      { data: { topics: [topic] }, type: "watch" },
      { data: { topics: [topic] }, type: "unwatch" },
    ]);
  });
});
