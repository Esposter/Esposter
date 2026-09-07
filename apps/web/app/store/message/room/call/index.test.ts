// @vitest-environment nuxt
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getMockSession } from "@@/server/trpc/context.test";
import { RoutePath, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<() => unknown>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

beforeEach(() => {
  useSessionMock.mockReturnValue(ref({ data: getMockSession() }));
});

describe(useCallStore, () => {
  const server = setupMswTrpc();
  const callSessionId = crypto.randomUUID();
  const imagePath = "/image.png";
  const roomId = crypto.randomUUID();
  const threadRootRowKey = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The camera flag is a participant row like any other, so the primitive unwinds and reports its rejection.
  // Rethrowing lets a rejected server write cancel the local work it is composed with — the picked background
  // Never reaches the camera that is in fact running, and the same throw inside joinCall tears down a live call
  test("applies a virtual background when the camera write is rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.setCameraEnabled.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const mediaStore = useMediaStore();
    const { isCameraEnabled, selectedVirtualBackground } = storeToRefs(mediaStore);
    const callStore = useCallStore();
    const { selectVirtualBackground } = callStore;
    const { activeCallSessionId } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    await selectVirtualBackground(imagePath);

    expect(selectedVirtualBackground.value).toBe(imagePath);
    expect(isCameraEnabled.value).toBe(false);
  });

  // A thread call carries the room it belongs to, so a route keyed on the room alone lands in the room with the
  // Thread pane shut — the call announced itself in a pane the link then refuses to open
  test.each([
    { expected: RoutePath.Messages(roomId), threadRootRowKey: "", title: "the room for a room call" },
    {
      expected: RoutePath.MessagesThread(roomId, threadRootRowKey),
      threadRootRowKey,
      title: "the thread for a thread call",
    },
  ])("routes to $title", ({ expected, threadRootRowKey: rootRowKey }) => {
    expect.hasAssertions();

    const callStore = useCallStore();
    const { callRoomId, callRoute, callThreadRootRowKey } = storeToRefs(callStore);
    callRoomId.value = roomId;
    callThreadRootRowKey.value = rootRowKey;

    expect(callRoute.value).toBe(expected);
  });

  // A join is the user's own click, and a rejection only this store sees — the callers are an inline click
  // Handler and a subscription onData, neither of which holds anything to catch a rethrow. So it unwinds the
  // State the attempt wrote and alerts, rather than leaving the failure to a caller that does not exist
  test("alerts and unwinds a rejected join", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.joinCallByRoomId.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const callStore = useCallStore();
    const { joinCallByRoomId } = callStore;
    const { activeCallSessionId, callRoomId, isConnecting } = storeToRefs(callStore);
    await joinCallByRoomId(roomId);

    expect(callRoomId.value).toBe("");
    expect(activeCallSessionId.value).toBe("");
    expect(isConnecting.value).toBe(false);
    expect(takeOne(alerts.value).type).toBe("error");
  });

  // The disconnect is tearing down an attempt that already failed, so its own rejection is not the failure the
  // User can act on. Propagated, it replaces the join's alert with nothing at all and leaves the connecting flag
  // Set, so the composer keeps spinning on a call that never started
  test.each([
    {
      handler: () =>
        trpcMsw.callSession.joinCall.mutation(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        }),
      join: async (callStore: ReturnType<typeof useCallStore>) => {
        await callStore.joinCall(callSessionId);
      },
      title: "an id",
    },
    {
      handler: () =>
        trpcMsw.callSession.joinCallByRoomId.mutation(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        }),
      join: async (callStore: ReturnType<typeof useCallStore>) => {
        await callStore.joinCallByRoomId(roomId);
      },
      title: "a room id",
    },
  ])("alerts a join by $title that a rejected teardown unwinds", async ({ handler, join }) => {
    expect.hasAssertions();

    server.use(handler());
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const liveKitStore = useLiveKitStore();
    vi.spyOn(liveKitStore, "disconnect").mockRejectedValue(new Error("disconnect"));
    const callStore = useCallStore();
    const { isConnecting } = storeToRefs(callStore);
    await join(callStore);

    expect(isConnecting.value).toBe(false);
    expect(takeOne(alerts.value).text).toBe("error");
  });

  test("routes to the call's own page when the call belongs to no room", () => {
    expect.hasAssertions();

    const callStore = useCallStore();
    const { activeCallSessionId, callRoute } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;

    expect(callRoute.value).toBe(RoutePath.Calls(callSessionId));
  });
});
