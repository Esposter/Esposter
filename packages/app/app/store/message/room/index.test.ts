// @vitest-environment nuxt
import { createRoom } from "@/services/message/room/createRoom.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { useRoomDialogStore } from "@/store/message/room/dialog";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useRoomStore, () => {
  const server = setupMswTrpc();
  const first = createRoom("first");
  const second = createRoom("second");

  beforeEach(() => {
    setActivePinia(createPinia());
  });

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
    server.use(
      trpcMsw.room.deleteRoom.mutation(async ({ input }) => {
        if (input !== first.id) return second;
        await isSecondDeleted;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const roomStore = useRoomStore();
    const { deleteRoom, pushRooms } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    const rejectedDeleteRoom = deleteRoom(first.id);
    await deleteRoom(second.id);
    onSecondDeleted(true);
    await rejectedDeleteRoom;

    expect(rooms.value).toStrictEqual([first]);
  });

  // Held the same way as the deletion above
  test("restores only the room whose leave was rejected", async () => {
    expect.hasAssertions();

    const { promise: isSecondLeft, resolve: onSecondLeft } = Promise.withResolvers<true>();
    server.use(
      trpcMsw.room.leaveRoom.mutation(async ({ input }) => {
        if (input !== first.id) return second.id;
        await isSecondLeft;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const roomStore = useRoomStore();
    const { leaveRoom, pushRooms } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    const rejectedLeaveRoom = leaveRoom(first.id);
    await leaveRoom(second.id);
    onSecondLeft(true);
    await rejectedLeaveRoom;

    expect(rooms.value).toStrictEqual([first]);
  });
});
