// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { createId } from "#shared/util/math/random/createId";
import { goOnline } from "#src/composables/shared/network.test";
import { createMeeting } from "#src/services/message/room/realtime/createMeeting.test";
import { createParticipant } from "#src/services/message/room/realtime/createParticipant.test";
import { spyOnMeetingInit } from "#src/services/message/room/realtime/spyOnMeetingInit.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createCounter } from "#src/services/shared/createCounter.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCallStore } from "#src/store/message/room/call/index";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { useRealtimeStore } from "#src/store/message/room/realtime";
import { CALL_ID_LENGTH } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The participant frames and their read are the seam, since the nuxt test environment does not run the call socket.
// Each call is one registration for a session, and its returned teardown is the release
const { subscribeCallParticipants } = vi.hoisted(() => ({
  subscribeCallParticipants: vi.fn<(callSessionId: string) => Promise<() => void>>(),
}));
vi.mock(import("#src/composables/message/room/call/useSubscribeCallParticipants"), () => ({
  useSubscribeCallParticipants: () => subscribeCallParticipants,
}));

const mountCallSubscribables = () =>
  mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        useCallSubscribables();
      },
    }),
  );

describe(useCallSubscribables, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const otherRoomId = v7();
  const callSessionId = createId(CALL_ID_LENGTH);
  const participantId = v7();
  let opened: ReturnType<typeof createCounter>;
  let closed: ReturnType<typeof createCounter>;
  let roomReads: ReturnType<typeof createCounter>;
  let wrapper: undefined | VueWrapper;

  beforeEach(() => {
    goOnline();
    opened = createCounter();
    closed = createCounter();
    roomReads = createCounter();
    subscribeCallParticipants.mockImplementation(() => {
      opened.increment();
      return Promise.resolve(() => {
        closed.increment();
      });
    });
    trpcMsw.callSession.readCallSessionId.query(({ input }) => {
      roomReads.increment();
      return input.roomId === roomId ? callSessionId : "";
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.restoreAllMocks();
  });

  // The joined call's participants are registered once when the call is joined, and released when it is left
  test("registers a joined call's participants once, and releases them when the call is left", async () => {
    expect.hasAssertions();

    wrapper = await mountCallSubscribables();
    const callStore = useCallStore();
    callStore.activeCallSessionId = callSessionId;
    await opened.reach(1);
    callStore.activeCallSessionId = "";
    await closed.reach(1);

    expect([opened.value, closed.value]).toStrictEqual([1, 1]);
  });

  // The speakers belong to the joined call, so a viewed room changing leaves them in place. A speaker is the SDK's
  // Active-speaker event, which the realtime store turns into the speaking list
  test("keeps the joined call's speakers when the viewed room changes", async () => {
    expect.hasAssertions();

    wrapper = await mountCallSubscribables();
    const callStore = useCallStore();
    const participantStore = useParticipantStore();
    const { speakingIds } = storeToRefs(participantStore);
    const { meeting } = createMeeting();
    spyOnMeetingInit(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect } = realtimeStore;
    callStore.activeCallSessionId = callSessionId;
    setCurrentRoomId(roomId);
    await opened.reach(1);
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    const peerId = v7();
    meeting.participants.joined.set(peerId, createParticipant(participantId));
    meeting.participants.emit("activeSpeaker", { peerId });
    setCurrentRoomId(otherRoomId);
    await roomReads.reach(2);
    await flushPromises();

    expect(speakingIds.value).toStrictEqual([participantId]);
  });
});
