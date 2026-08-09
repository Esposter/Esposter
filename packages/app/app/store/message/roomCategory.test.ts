// @vitest-environment nuxt
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useRoomCategoryStore, () => {
  const server = setupMswTrpc();
  const createdAt = new Date(0);
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const name = "name";
  const updatedName = "updatedName";
  const rejectedName = "rejectedName";
  const createCategory = (categoryId: string): RoomCategoryInMessage => ({
    createdAt,
    deletedAt: null,
    id: categoryId,
    name,
    position: 0,
    updatedAt: createdAt,
    userId,
  });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Two renames of one category queue under its id, so the second one's rollback has to undo its own write —
  // Restoring the list as it looked when the user typed would drop the rename the first one just persisted,
  // And nothing reconciles that until a reload
  test("rolls a failed update back to the state the update ahead of it stored", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.room.category.updateRoomCategory.mutation(({ input }) => {
        if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: name });

        isFailing = true;
        return { ...createCategory(id), ...input };
      }),
    );
    const roomCategoryStore = useRoomCategoryStore();
    const { categories } = storeToRefs(roomCategoryStore);
    const { updateRoomCategory } = roomCategoryStore;
    categories.value = [createCategory(id)];
    const storedCategory = takeOne(categories.value);
    await Promise.all([updateRoomCategory({ id, name: updatedName }), updateRoomCategory({ id, name: rejectedName })]);

    expect(takeOne(categories.value).name).toBe(updatedName);
    // Restored in place rather than by swapping the list for copies, so the create placeholder a list may still
    // Hold keeps the identity its own onSuccess reconciles the server row onto
    expect(takeOne(categories.value)).toBe(storedCategory);
  });

  // A double-confirmed delete queues under the same id, and the second one is refused because the row is already
  // Gone — its rollback must undo only its own removal, or it puts the deleted category back on screen
  test("does not restore a category the delete ahead of it removed", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.room.category.deleteRoomCategory.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "NOT_FOUND", message: name });

        isFailing = true;
        return createCategory(id);
      }),
    );
    const roomCategoryStore = useRoomCategoryStore();
    const { categories } = storeToRefs(roomCategoryStore);
    const { deleteRoomCategory } = roomCategoryStore;
    categories.value = [createCategory(id), createCategory(otherId)];
    await Promise.all([deleteRoomCategory(id), deleteRoomCategory(id)]);

    expect(categories.value.map(({ id: categoryId }) => categoryId)).toStrictEqual([otherId]);
  });
});
