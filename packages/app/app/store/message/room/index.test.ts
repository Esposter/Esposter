// @vitest-environment nuxt
import { createRoom } from "@/services/message/room/createRoom.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { useDialogStore } from "@/store/message/room/dialog";
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

    const roomStore = useRoomStore();
    const { currentRoomId, scopedRoomId } = storeToRefs(roomStore);
    const dialogStore = useDialogStore();
    const { settingsRoomId } = storeToRefs(dialogStore);

    expect(scopedRoomId.value).toBe(currentRoomId.value);

    settingsRoomId.value = second.id;

    expect(scopedRoomId.value).toBe(second.id);

    settingsRoomId.value = "";

    expect(scopedRoomId.value).toBe(currentRoomId.value);
  });

  // Every room is its own target, so removals overlap: the rejected one has to put back its own room only.
  // Reinstating the list as it stood would re-add the room the successful removal took out.
  // The rejection is held until the successful removal has settled in the store — issued together, the reject
  // Can land first and roll back against a list nothing has shortened yet, which passes either implementation
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
