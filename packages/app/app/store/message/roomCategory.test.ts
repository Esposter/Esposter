// @vitest-environment nuxt
import { createRoomCategory } from "@/services/message/roomCategory/createRoomCategory.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useRoomCategoryStore } from "@/store/message/roomCategory";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useRoomCategoryStore, () => {
  const server = setupMswTrpc();
  const id = crypto.randomUUID();
  const otherId = crypto.randomUUID();
  const name = "name";
  const updatedName = "updatedName";
  const rejectedName = "rejectedName";
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Two renames of one room category queue under its id, so the second one's rollback has to undo its own write —
  // Restoring the list as it looked when the user typed would drop the rename the first one just persisted,
  // And nothing reconciles that until a reload
  test("rolls a failed update back to the state the update ahead of it stored", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.room.category.updateRoomCategory.mutation(({ input }) => {
        if (isFailing) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: name });

        isFailing = true;
        return { ...createRoomCategory({ id }), ...input };
      }),
    );
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { updateRoomCategory } = roomCategoryStore;
    roomCategories.value = [createRoomCategory({ id })];
    const storedCategory = takeOne(roomCategories.value);
    await Promise.all([updateRoomCategory({ id, name: updatedName }), updateRoomCategory({ id, name: rejectedName })]);

    expect(takeOne(roomCategories.value).name).toBe(updatedName);
    // Restored in place rather than by swapping the list for copies, so the create placeholder a list may still
    // Hold keeps the identity its own onSuccess reconciles the server row onto
    expect(takeOne(roomCategories.value)).toBe(storedCategory);
  });

  // A double-confirmed delete queues under the same id, and the second one is refused because the row is already
  // Gone — its rollback must undo only its own removal, or it puts the deleted room category back on screen
  test("does not restore a roomCategory the delete ahead of it removed", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.room.category.deleteRoomCategory.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "NOT_FOUND", message: name });

        isFailing = true;
        return createRoomCategory({ id });
      }),
    );
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { deleteRoomCategory } = roomCategoryStore;
    roomCategories.value = [createRoomCategory({ id }), createRoomCategory({ id: otherId })];
    await Promise.all([deleteRoomCategory(id), deleteRoomCategory(id)]);

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([otherId]);
  });

  // Each room category is its own target, so two deletions overlap on one list. The failing one must put back only the
  // Row it removed — reinstating the list resurrects the room category the deletion beside it already took out
  test("puts back only the roomCategory whose deletion was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.room.category.deleteRoomCategory.mutation(({ input }) => {
        if (input === id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: name });
        return createRoomCategory({ id: input });
      }),
    );
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { deleteRoomCategory } = roomCategoryStore;
    roomCategories.value = [createRoomCategory({ id }), createRoomCategory({ id: otherId })];
    await Promise.all([deleteRoomCategory(id), deleteRoomCategory(otherId)]);

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([id]);
  });

  // A reorder moves positions, so that is all its rollback owes back. Reinstating the list drops whatever landed
  // While the drag was in flight — here a room category created meanwhile, delivered from inside the request so it
  // Lands after the reorder applied and before its rejection unwinds
  test("restores only the positions the rejected reorder moved", async () => {
    expect.hasAssertions();

    const thirdId = crypto.randomUUID();
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { reorderRoomCategories } = roomCategoryStore;
    server.use(
      trpcMsw.room.category.reorderRoomCategories.mutation(() => {
        roomCategories.value = [...roomCategories.value, { ...createRoomCategory({ id: thirdId }), position: 2 }];
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: name });
      }),
    );
    const first = { ...createRoomCategory({ id }), position: 0 };
    const second = { ...createRoomCategory({ id: otherId }), position: 1 };
    roomCategories.value = [first, second];
    await reorderRoomCategories([second, first]);

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([id, otherId, thirdId]);
    expect(roomCategories.value.map(({ position }) => position)).toStrictEqual([0, 1, 2]);
  });
});
