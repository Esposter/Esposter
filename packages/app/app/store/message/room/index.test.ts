// @vitest-environment nuxt
import type { RoomInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { MimeCategory, RoomType } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

// A direct message is a room row too, so the direct message store's tests build their fixtures from here rather
// Than restating every column of the same table
export const createRoom = (name: string, type = RoomType.Room): RoomInMessage => ({
  allowedMimeCategories: [MimeCategory.Image],
  categoryId: null,
  createdAt: new Date("1970-01-01"),
  deletedAt: null,
  id: crypto.randomUUID(),
  image: "",
  isReadOnly: false,
  maxFileSizeBytes: null,
  name,
  participantKey: type === RoomType.DirectMessage ? crypto.randomUUID() : null,
  slowmodeMs: null,
  topic: "",
  type,
  updatedAt: new Date("1970-01-01"),
  userId: crypto.randomUUID(),
});

describe(useRoomStore, () => {
  const server = setupMswTrpc();
  const first = createRoom("first");
  const second = createRoom("second");

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Every room is its own target, so removals overlap: the rejected one has to put back its own room only.
  // Reinstating the list as it stood would re-add the room the successful removal took out
  test("restores only the room whose deletion was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.room.deleteRoom.mutation(({ input }) => {
        if (input === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return second;
      }),
    );
    const roomStore = useRoomStore();
    const { deleteRoom, pushRooms } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    await Promise.all([deleteRoom(first.id), deleteRoom(second.id)]);

    expect(rooms.value).toStrictEqual([first]);
  });

  test("restores only the room whose leave was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.room.leaveRoom.mutation(({ input }) => {
        if (input === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        return second.id;
      }),
    );
    const roomStore = useRoomStore();
    const { leaveRoom, pushRooms } = roomStore;
    const { rooms } = storeToRefs(roomStore);
    pushRooms(first, second);
    await Promise.all([leaveRoom(first.id), leaveRoom(second.id)]);

    expect(rooms.value).toStrictEqual([first]);
  });
});
