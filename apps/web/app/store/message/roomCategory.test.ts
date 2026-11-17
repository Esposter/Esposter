// @vitest-environment nuxt
import { getMockSession } from "#server/trpc/context.test";
import { useSession } from "#src/services/auth/authClient.test";
import { createRoomCategory } from "#src/services/message/roomCategory/createRoomCategory.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useRoomCategoryStore } from "#src/store/message/roomCategory";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useRoomCategoryStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const id = v7();
  const otherId = v7();
  const name = "name";
  const serverPosition = 1;

  test("a new category is drawn under the id the client gave it", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<string>();
    useSession.mockReturnValue(ref({ data: { user: { id: getMockSession().user.id } } }));
    trpcMsw.room.category.createRoomCategory.mutation(({ input }) => {
      resolve(input.id);
      return createRoomCategory(input);
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { createRoomCategory: storeCreateRoomCategory } = roomCategoryStore;
    storeCreateRoomCategory({ name });
    const sentId = await promise;
    await flushPromises();

    expect(roomCategories.value.map((roomCategory) => roomCategory.id)).toStrictEqual([sentId]);
  });

  // The client draws a new category at the position it expects the server to append it at, and the position the server
  // Stored is the one the next read sorts by, so the row takes it once the create lands
  test("a created category takes the position the server stored", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref({ data: { user: { id: getMockSession().user.id } } }));
    trpcMsw.room.category.createRoomCategory.mutation(({ input }) =>
      createRoomCategory({ ...input, position: serverPosition }),
    );
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { createRoomCategory: storeCreateRoomCategory } = roomCategoryStore;
    storeCreateRoomCategory({ name });
    await waitForSynchronizedFunctions();

    expect(roomCategories.value.map(({ position }) => position)).toStrictEqual([serverPosition]);
  });

  test("a rejected optimistic delete restores the list and shows an error", async () => {
    expect.hasAssertions();

    trpcMsw.room.category.deleteRoomCategory.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: name });
    });
    const alertStore = useAlertStore();
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { deleteRoomCategory } = roomCategoryStore;
    roomCategories.value = [createRoomCategory({ id })];
    deleteRoomCategory(id);
    await waitForSynchronizedFunctions();

    expect(roomCategories.value.map((roomCategory) => roomCategory.id)).toStrictEqual([id]);
    expect(alertStore.alerts).toHaveLength(1);
  });

  // A double-confirmed delete queues under the same id, and the second one is refused because the row is already
  // Gone — its rollback must undo only its own removal, or it puts the deleted room category back on screen
  test("does not restore a roomCategory the delete ahead of it removed", async () => {
    expect.hasAssertions();

    let isFailing = false;
    trpcMsw.room.category.deleteRoomCategory.mutation(() => {
      if (isFailing) throw new TRPCError({ code: "NOT_FOUND", message: name });

      isFailing = true;
      return createRoomCategory({ id });
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { deleteRoomCategory } = roomCategoryStore;
    roomCategories.value = [createRoomCategory({ id }), createRoomCategory({ id: otherId })];
    deleteRoomCategory(id);
    deleteRoomCategory(id);
    await flushPromises();

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([otherId]);
  });

  // Each room category is its own target, so two deletions overlap on one list and the failing one must put
  // Back only the row it removed
  test("puts back only the roomCategory whose deletion was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.room.category.deleteRoomCategory.mutation(({ input }) => {
      if (input === id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: name });
      return createRoomCategory({ id: input });
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { deleteRoomCategory } = roomCategoryStore;
    roomCategories.value = [createRoomCategory({ id }), createRoomCategory({ id: otherId })];
    deleteRoomCategory(id);
    deleteRoomCategory(otherId);
    await flushPromises();

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([id]);
  });

  // A reorder moves positions, so that is all its rollback owes back. The room category created meanwhile is
  // Delivered from inside the request, so it lands after the reorder applied and before its rejection unwinds
  test("restores only the positions the rejected reorder moved", async () => {
    expect.hasAssertions();

    const thirdId = v7();
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { reorderRoomCategories } = roomCategoryStore;
    trpcMsw.room.category.reorderRoomCategories.mutation(() => {
      roomCategories.value = [...roomCategories.value, { ...createRoomCategory({ id: thirdId }), position: 2 }];
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: name });
    });
    const first = { ...createRoomCategory({ id }), position: 0 };
    const second = { ...createRoomCategory({ id: otherId }), position: 1 };
    roomCategories.value = [first, second];
    reorderRoomCategories([second, first]);
    await flushPromises();

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([id, otherId, thirdId]);
    expect(roomCategories.value.map(({ position }) => position)).toStrictEqual([0, 1, 2]);
  });
});
