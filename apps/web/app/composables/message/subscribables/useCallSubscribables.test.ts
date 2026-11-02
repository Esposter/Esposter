// @vitest-environment nuxt
import type { Unsubscribable } from "@trpc/server/observable";
import type { VueWrapper } from "@vue/test-utils";

import { createId } from "#shared/util/math/random/createId";
import { goOnline } from "@/composables/shared/network.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createCounter } from "@/services/shared/createCounter.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { CALL_ID_LENGTH } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The nuxt test environment does not run the WebSocket a subscription rides, so the seam that opens a session's
// Participant subscription is replaced by a recorder. Each call is one open of that session, and the read a real open
// Makes of its participants is the one it stands for
const { subscribeCallParticipants } = vi.hoisted(() => ({
  subscribeCallParticipants: vi.fn<(callSessionId: string) => Promise<Unsubscribable>>(),
}));
vi.mock(import("@/composables/message/room/call/useSubscribeCallParticipants"), () => ({
  useSubscribeCallParticipants: () => subscribeCallParticipants,
}));

describe(useCallSubscribables, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const callSessionId = createId(CALL_ID_LENGTH);
  const participantId = crypto.randomUUID();
  let opened: ReturnType<typeof createCounter>;
  let closed: ReturnType<typeof createCounter>;
  let roomReads: ReturnType<typeof createCounter>;
  let wrapper: undefined | VueWrapper;
  const mountCallSubscribables = () =>
    mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          useCallSubscribables();
        },
      }),
    );

  beforeEach(() => {
    goOnline();
    opened = createCounter();
    closed = createCounter();
    roomReads = createCounter();
    subscribeCallParticipants.mockImplementation(async () => {
      opened.increment();
      return {
        unsubscribe: () => {
          closed.increment();
        },
      };
    });
    trpcMsw.callSession.readCallSessionId.query(({ input }) => {
      roomReads.increment();
      return input.roomId === roomId ? callSessionId : "";
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  // Viewing a room whose call the user has joined opens the session once: the joined call holds it, and the viewed room
  // Yields to it rather than opening a second subscription and a second read
  test("opens a joined call's participants once when its room is viewed", async () => {
    expect.hasAssertions();

    wrapper = await mountCallSubscribables();
    useCallStore().activeCallSessionId = callSessionId;
    setCurrentRoomId(roomId);
    await opened.reach(1);
    await flushPromises();

    expect(opened.value).toBe(1);
  });

  // Joining the call a room is viewed for hands its subscription to the joined call, and leaving that call while the room
  // Is still viewed hands it back — so the session is open exactly once at every step
  test("hands a viewed call to the joined call and back when the joined call ends", async () => {
    expect.hasAssertions();

    wrapper = await mountCallSubscribables();
    const callStore = useCallStore();
    setCurrentRoomId(roomId);
    await opened.reach(1);

    callStore.activeCallSessionId = callSessionId;
    await opened.reach(2);
    await closed.reach(1);

    expect(opened.value - closed.value).toBe(1);

    callStore.activeCallSessionId = "";
    await closed.reach(2);
    await opened.reach(3);

    expect(opened.value - closed.value).toBe(1);
  });

  // The speakers belong to the joined call, so a viewed room changing leaves them in place
  test("keeps the joined call's speakers when the viewed room changes", async () => {
    expect.hasAssertions();

    wrapper = await mountCallSubscribables();
    const callStore = useCallStore();
    const participantStore = useParticipantStore();
    const { createSpeaker } = participantStore;
    const { speakingIds } = storeToRefs(participantStore);
    callStore.activeCallSessionId = callSessionId;
    setCurrentRoomId(roomId);
    await opened.reach(1);
    createSpeaker(participantId);
    setCurrentRoomId(otherRoomId);
    await roomReads.reach(2);
    await flushPromises();

    expect(speakingIds.value).toStrictEqual([participantId]);
  });
});
