// @vitest-environment nuxt
import type { RoomInMessage } from "@esposter/db-schema";

import { useSaveRoom } from "@/composables/message/room/useSaveRoom";
import { createRoom } from "@/services/message/room/createRoom.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

// Every panel saves through the store's row rather than the object it was handed, so the composable is given a
// Getter over the store — a snapshot taken from a detached fixture would read back whatever the test wrote and
// Pass however the rollback is scoped
const mountSaveRoom = async (room: RoomInMessage) => {
  let saveRoom: ReturnType<typeof useSaveRoom> | undefined;
  await mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        const roomStore = useRoomStore();
        const { pushRooms } = roomStore;
        const { rooms } = storeToRefs(roomStore);
        pushRooms(room);
        saveRoom = useSaveRoom(computed(() => rooms.value.find(({ id }) => id === room.id) ?? room));
      },
    }),
  );
  const roomStore = useRoomStore();
  const { storeUpdateRoom } = roomStore;
  const { rooms } = storeToRefs(roomStore);
  return {
    getRoom: () => rooms.value.find(({ id }) => id === room.id),
    saveRoom,
    storeUpdateRoom,
  };
};

describe(useSaveRoom, () => {
  const server = setupMswTrpc();

  // The rollback restores the keys the save wrote, not the row it read. A whole-row restore looks identical
  // Until something else writes the same row while the save is in flight — a subscription, another panel — and
  // Then it reverts that write too, silently undoing a change this save never touched and never persisted
  test("restores only the fields it saved when the save is rejected", async () => {
    expect.hasAssertions();

    const room = createRoom("original name");
    const { getRoom, saveRoom, storeUpdateRoom } = await mountSaveRoom(room);
    server.use(
      trpcMsw.room.updateRoom.mutation(() => {
        // The handler runs after the optimistic apply and before the rollback, which is the only window in
        // Which a concurrent write is exposed to it
        storeUpdateRoom({ id: room.id, topic: "pushed topic" });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "rejected" });
      }),
    );
    await saveRoom?.({ name: "rejected name" });

    expect(getRoom()?.name).toBe("original name");
    expect(getRoom()?.topic).toBe("pushed topic");
  });

  test("keeps the saved fields when the save lands", async () => {
    expect.hasAssertions();

    const room = createRoom("original name");
    const { getRoom, saveRoom } = await mountSaveRoom(room);
    server.use(trpcMsw.room.updateRoom.mutation(() => ({ ...room, name: "new name" })));
    await saveRoom?.({ name: "new name" });

    expect(getRoom()?.name).toBe("new name");
  });
});
