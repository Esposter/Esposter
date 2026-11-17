// @vitest-environment nuxt
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { useReadRoomCategories } from "#src/composables/message/room/useReadRoomCategories";
import { createRoomCategory } from "#src/services/message/roomCategory/createRoomCategory.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomCategoryStore } from "#src/store/message/roomCategory";
import { TRPCError } from "@trpc/server";
import { describe, expect, test, vi } from "vitest";

describe(useReadRoomCategories, () => {
  const { trpcMsw } = setupMswTrpc();

  // A failed read is recorded for the list to draw, not thrown out of the setup that awaits it
  // A retry that lands clears the error and fills the categories
  test("records a failed read, and a retry that lands clears it", async () => {
    expect.hasAssertions();

    const roomCategory = createRoomCategory();
    const queryRoomCategories = vi
      .fn<() => RoomCategoryInMessage[]>()
      .mockImplementationOnce(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      })
      .mockReturnValue([roomCategory]);
    trpcMsw.room.category.readRoomCategories.query(queryRoomCategories);
    const { isError, readRoomCategories } = useReadRoomCategories();
    await readRoomCategories();

    expect(isError.value).toBe(true);

    await readRoomCategories();
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);

    expect(isError.value).toBe(false);
    expect(roomCategories.value).toStrictEqual([roomCategory]);
  });
});
