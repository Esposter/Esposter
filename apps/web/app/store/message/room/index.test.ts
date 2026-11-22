// @vitest-environment nuxt
import { useReadRooms } from "#src/composables/message/room/useReadRooms";
import { useSession } from "#src/services/auth/authClient.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { pushRooms } from "#src/services/message/room/pushRooms.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useRoomStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const first = createRoom("name");
  const second = createRoom("name");
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The cog on a room row opens settings for that room without taking the reader there, so every room-scoped
  // Slice a panel reads has to follow the dialog rather than the route — reading the route's room instead is what
  // Made the panels show the wrong room's members until the click navigated first
  test("scopes room-scoped reads to the room settings is open for", () => {
    expect.hasAssertions();

    // A room is on the route throughout, so the two states the scope can be in are distinguishable — read against
    // An empty route both assertions would hold for a scope that ignores the route entirely
    setRouteId(first.id);
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

  // A refused deletion changes nothing: the room is held, and its membership with it, so the list keeps it
  test("keeps a room in the list when its deletion is refused", async () => {
    expect.hasAssertions();

    trpcMsw.room.deleteRoom.mutation(() => {
      throw trpcError;
    });
    const roomStore = useRoomStore();
    const { deleteRoom } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    await deleteRoom(first.id);

    expect(rooms.value).toStrictEqual([first, second]);
  });

  // The membership a leave answers with is the tombstone the list takes the room off by
  test("takes a room off the list with the membership tombstone its leave answers with", async () => {
    expect.hasAssertions();

    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    trpcMsw.room.leaveRoom.mutation(() =>
      createUserToRoom({ deletedAt: new Date(0), roomId: first.id, userId: session.user.id, version: 1 }),
    );
    const roomStore = useRoomStore();
    const { leaveRoom } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    await leaveRoom(first.id);
    await flushPromises();

    expect(rooms.value.map(({ id }) => id)).toStrictEqual([second.id]);
  });

  // A refused leave changes nothing, so the reader stays in the room they were in
  test("keeps the reader in the room when the leave is refused", async () => {
    expect.hasAssertions();

    trpcMsw.room.leaveRoom.mutation(() => {
      throw trpcError;
    });
    const roomStore = useRoomStore();
    const { leaveRoom } = roomStore;
    const { currentRoomId, rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    setRouteId(first.id);
    await leaveRoom(first.id);
    await flushPromises();

    expect(currentRoomId.value).toBe(first.id);
    expect(rooms.value).toStrictEqual([first, second]);
  });

  // The page's answer lands after the reader's socket has delivered the membership tombstone of the room, so the read
  // Brings back the row the tombstone removed. A room the list shows is the one whose membership is live, so the answer
  // Re-adds nothing, and the stale live membership the answer also carries loses to the tombstone's version
  test("a late page read does not re-add a room whose membership tombstone arrived", async () => {
    expect.hasAssertions();

    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    const liveMembership = createUserToRoom({ roomId: first.id, userId: session.user.id });
    const { promise: lateReadHeld, resolve: onLateReadHeld } = Promise.withResolvers<true>();
    const { promise: tombstoneArrived, resolve: onTombstoneArrived } = Promise.withResolvers<true>();
    let readCount = 0;
    trpcMsw.room.readRooms.query(async () => {
      readCount++;
      if (readCount > 1) {
        onLateReadHeld(true);
        await tombstoneArrived;
      }
      return { items: [{ ...first, displayName: first.name }], nextCursor: "" };
    });
    trpcMsw.userToRoom.readMyUsersToRooms.query(() => [liveMembership]);
    trpcMsw.role.readMyPermissions.query(() => []);
    trpcMsw.role.readRoles.query(() => []);
    const roomStore = useRoomStore();
    const { rooms } = storeToRefs(roomStore);
    const { readRooms } = await useReadRooms();
    await readRooms();

    expect(rooms.value.map(({ id }) => id)).toStrictEqual([first.id]);

    const lateRead = readRooms();
    await lateReadHeld;
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([
      createUserToRoom({ deletedAt: new Date(0), roomId: first.id, userId: session.user.id, version: 1 }),
    ]);
    onTombstoneArrived(true);
    await lateRead;
    await flushPromises();

    expect(rooms.value).toStrictEqual([]);
  });

  // A reader offline while the room was removed holds the room and its live membership from before. The page the resume
  // Read answers names only live rooms, so it leaves the room out, and absence never removes a row: the read names the
  // Held membership the page left out, and its tombstone is the answer that takes the room off the list
  test("a resume read drops a room removed while the reader was offline", async () => {
    expect.hasAssertions();

    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    pushRooms(first);
    trpcMsw.room.readRooms.query(() => ({ items: [], nextCursor: "" }));
    trpcMsw.userToRoom.readMyUsersToRooms.query(({ input }) =>
      input.roomIds.includes(first.id)
        ? [createUserToRoom({ deletedAt: new Date(0), roomId: first.id, userId: session.user.id, version: 1 })]
        : [],
    );
    trpcMsw.role.readMyPermissions.query(() => []);
    trpcMsw.role.readRoles.query(() => []);
    const roomStore = useRoomStore();
    const { rooms } = storeToRefs(roomStore);
    const { readRooms } = await useReadRooms();
    await readRooms();
    await flushPromises();

    expect(rooms.value).toStrictEqual([]);
  });

  test("a cached page restores its rooms at their versions, and the list shows them once the membership is held", () => {
    expect.hasAssertions();

    const session = { user: { id: v7() } };
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    const roomStore = useRoomStore();
    const { rooms } = storeToRefs(roomStore);
    const { getSlice } = roomStore;
    const { initializeCursorPaginationData, items } = getSlice();
    initializeCursorPaginationData({ items: [{ ...first, version: 1 }], nextCursor: "" });

    expect(items.value).toStrictEqual([]);

    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([createUserToRoom({ roomId: first.id, userId: session.user.id })]);

    expect(rooms.value.map(({ id }) => id)).toStrictEqual([first.id]);
  });
});
