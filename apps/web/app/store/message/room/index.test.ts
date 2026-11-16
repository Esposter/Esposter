// @vitest-environment nuxt
import { useSession } from "#src/services/auth/authClient.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { useRoomStore } from "#src/store/message/room/index";
import { getRouteParam } from "#src/util/router/getRouteParam";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useRoomStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const first = createRoom("name");
  const second = createRoom("name");

  // The cog on a room row opens settings for that room without taking the reader there, so every room-scoped
  // Slice a panel reads has to follow the dialog rather than the route — reading the route's room instead is what
  // Made the panels show the wrong room's members until the click navigated first
  test("scopes room-scoped reads to the room settings is open for", () => {
    expect.hasAssertions();

    // A room is on the route throughout, so the two states the scope can be in are distinguishable — read against
    // An empty route both assertions would hold for a scope that ignores the route entirely
    setCurrentRoomId(first.id);
    const roomStore = useRoomStore();
    const { scopedRoomId } = storeToRefs(roomStore);
    const roomDialogStore = useRoomDialogStore();
    const { settingsRoomId } = storeToRefs(roomDialogStore);

    expect(scopedRoomId.value).toBe(first.id);

    settingsRoomId.value = second.id;

    expect(scopedRoomId.value).toBe(second.id);

    settingsRoomId.value = "";

    expect(scopedRoomId.value).toBe(first.id);
  });

  // Every room is its own target, so removals overlap: the rejected one has to put back its own room only.
  test("restores only the room whose deletion was rejected", async () => {
    expect.hasAssertions();

    const { promise: isSecondDeleted, resolve: onSecondDeleted } = Promise.withResolvers<true>();
    const { promise: isFirstCalled, resolve: onFirstCalled } = Promise.withResolvers<true>();
    trpcMsw.room.deleteRoom.mutation(async ({ input }) => {
      if (input !== first.id) return second;
      onFirstCalled(true);
      await isSecondDeleted;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roomStore = useRoomStore();
    const { deleteRoom, pushRooms } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    deleteRoom(first.id);
    // A second call issued in the same tick would share the first one's batch and settle with it
    await isFirstCalled;
    deleteRoom(second.id);
    await flushPromises();
    onSecondDeleted(true);
    await flushPromises();

    expect(rooms.value).toStrictEqual([first]);
  });

  // Held the same way as the deletion above
  test("restores only the room whose leave was rejected", async () => {
    expect.hasAssertions();

    const { promise: isSecondLeft, resolve: onSecondLeft } = Promise.withResolvers<true>();
    const { promise: isFirstCalled, resolve: onFirstCalled } = Promise.withResolvers<true>();
    trpcMsw.room.leaveRoom.mutation(async ({ input }) => {
      if (input !== first.id) return second.id;
      onFirstCalled(true);
      await isSecondLeft;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roomStore = useRoomStore();
    const { leaveRoom, pushRooms } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    leaveRoom(first.id);
    // A second call issued in the same tick would share the first one's batch and settle with it
    await isFirstCalled;
    leaveRoom(second.id);
    await flushPromises();
    onSecondLeft(true);
    await flushPromises();

    expect(rooms.value).toStrictEqual([first]);
  });

  // The reader is in the room the leave takes them out of, so the refusal puts them back in it rather than leaving them
  // In the room the leave navigated them to
  test("a refused leave brings the reader back to the room", async () => {
    expect.hasAssertions();

    // The route's auth middleware reads the session in the nuxt shape, so the reader is answered as signed in
    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    // The navigation the leave starts is not held by the drain, since the room's page and middleware load on first use,
    // So the refusal waits until the reader has landed in the room the leave sent them to, as it does in the app
    const router = useRouter();
    const { promise: isInSecond, resolve: onInSecond } = Promise.withResolvers<true>();
    const removeLandingListener = router.afterEach((to) => {
      if (getRouteParam(to.params, "id") !== second.id) return;
      removeLandingListener();
      onInSecond(true);
    });
    trpcMsw.room.leaveRoom.mutation(async () => {
      await isInSecond;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roomStore = useRoomStore();
    const { leaveRoom, pushRooms } = roomStore;
    const { currentRoom, currentRoomId } = storeToRefs(roomStore);
    pushRooms(first, second);
    setCurrentRoomId(first.id);
    leaveRoom(first.id);
    await waitForSynchronizedFunctions();
    // The refusal's rollback starts the navigation back as it lands, after the drain above took its snapshot
    await waitForSynchronizedFunctions();

    expect(currentRoomId.value).toBe(first.id);
    expect(currentRoom.value).toStrictEqual(first);
  });

  // A refusal can land before the navigation away has, while the reader still reads as in the room, and the navigation
  // Back is what cancels the one still on its way
  test("a leave refused before its navigation lands keeps the reader in the room", async () => {
    expect.hasAssertions();

    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    trpcMsw.room.leaveRoom.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const roomStore = useRoomStore();
    const { leaveRoom, pushRooms } = roomStore;
    const { currentRoomId } = storeToRefs(roomStore);
    pushRooms(first, second);
    setCurrentRoomId(first.id);
    leaveRoom(first.id);
    await waitForSynchronizedFunctions();
    // The navigations the removal and its rollback start are drained once the write that started them has settled
    await waitForSynchronizedFunctions();

    expect(currentRoomId.value).toBe(first.id);
  });
});
