// @vitest-environment nuxt
import { createId } from "#shared/util/math/random/createId";
import { openRealtimeSocket } from "@/services/realtime/openRealtimeSocket.test";
import { useConnectionStore } from "@/store/realtime/connection";
import { CALL_ID_LENGTH } from "@esposter/db-schema";
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
  // its integer id and the frame names neither
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

    onFrame?.(JSON.stringify({ data: { id: 1 }, type: "deleteMessage" }));

    expect(handler).toHaveBeenCalledExactlyOnceWith({ id: 1 }, roomId);
  });
});
