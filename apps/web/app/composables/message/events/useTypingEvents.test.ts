// @vitest-environment nuxt
import { useTypingEvents } from "#src/composables/message/events/useTypingEvents";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { useDataStore } from "#src/store/message/data";
import { useConnectionStore } from "#src/store/realtime/connection";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useTypingEvents, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // A typist's removal timer belongs to the scope that set it, so once that scope is disposed nothing may fire it
  test("does not remove a typist after its scope is disposed", async () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    const roomId = v7();
    const userId = v7();
    Object.assign(useRouter().currentRoute.value.params, { id: roomId });
    const scope = effectScope();
    scope.run(() => {
      useTypingEvents();
    });
    const connectionStore = useConnectionStore();
    await connectionStore.openRoom(
      roomId,
      () => undefined,
      () => undefined,
    );
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    onFrame?.(JSON.stringify({ data: { roomId, userId, username: "username" }, type: "createTyping" }));
    await flushPromises();
    const dataStore = useDataStore();
    const { typings } = storeToRefs(dataStore);
    expect(typings.value.map((typing) => typing.userId)).toStrictEqual([userId]);
    scope.stop();
    vi.advanceTimersByTime(Temporal.Duration.from({ seconds: 3 }).total("milliseconds"));

    expect(typings.value.map((typing) => typing.userId)).toStrictEqual([userId]);
  });
});
