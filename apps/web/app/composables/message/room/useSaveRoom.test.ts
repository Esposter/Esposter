// @vitest-environment nuxt
import type { RoomInMessage } from "@esposter/db-schema";

import { useSaveRoom } from "#src/composables/message/room/useSaveRoom";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { pushRooms } from "#src/services/message/room/pushRooms.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomStore } from "#src/store/message/room/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

// Every panel saves through the store's row rather than the object it was handed, so the composable is given a
// Getter over the store — a snapshot taken from a detached fixture would read back whatever the test wrote
const mountSaveRoom = async (room: RoomInMessage) => {
  let saveRoom: ReturnType<typeof useSaveRoom> | undefined;
  await mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        pushRooms(room);
        const roomStore = useRoomStore();
        const { rooms } = storeToRefs(roomStore);
        saveRoom = useSaveRoom(computed(() => rooms.value.find(({ id }) => id === room.id) ?? room));
      },
    }),
  );
  const roomStore = useRoomStore();
  const { arriveRooms } = roomStore;
  const { rooms } = storeToRefs(roomStore);
  return { arriveRooms, getRoom: () => rooms.value.find(({ id }) => id === room.id), saveRoom };
};

describe(useSaveRoom, () => {
  const { trpcMsw } = setupMswTrpc();
  const name = "name";
  // A name that trims to empty is one the save rejects, so the name it writes keeps a character
  const savedName = "a";
  const topic = "topic";

  // A refused save changes nothing of its own, so what another write set on the row while it was in flight stays. The
  // Other write arrives as a newer version of the row, and the refusal drops only the save's own entry
  test("keeps what another write set on the row when the save is refused", async () => {
    expect.hasAssertions();

    const room = createRoom(name);
    const { arriveRooms, getRoom, saveRoom } = await mountSaveRoom(room);
    trpcMsw.room.updateRoom.mutation(() => {
      // The handler runs while the save is in flight, which is the only window in which another write can land first
      arriveRooms([{ ...room, topic, version: 1 }]);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    saveRoom?.({ name: savedName });
    await flushPromises();

    expect(getRoom()?.name).toBe(name);
    expect(getRoom()?.topic).toBe(topic);
  });

  test("keeps the saved fields when the save lands", async () => {
    expect.hasAssertions();

    const room = createRoom(name);
    const { getRoom, saveRoom } = await mountSaveRoom(room);
    trpcMsw.room.updateRoom.mutation(() => ({ ...room, name: savedName, version: 1 }));
    saveRoom?.({ name: savedName });
    await flushPromises();

    expect(getRoom()?.name).toBe(savedName);
  });
});
