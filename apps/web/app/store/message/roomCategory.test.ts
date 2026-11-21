// @vitest-environment nuxt
import { getMockSession } from "#server/trpc/context.test";
import { useSession } from "#src/services/auth/authClient.test";
import { createRoomCategory } from "#src/services/message/roomCategory/createRoomCategory.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useRoomCategoryStore } from "#src/store/message/roomCategory";
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
  const trpcError = new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

  // A category is drawn under the id the client gave it, before the server answers, and the row the server answers
  // With takes its place
  test("draws a new category under the id the client gave it, and holds the server's row once it lands", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<string>();
    useSession.mockReturnValue(ref({ data: { user: { id: getMockSession().user.id } } }));
    trpcMsw.room.category.createRoomCategory.mutation(({ input }) => {
      resolve(input.id);
      return createRoomCategory({ ...input, position: serverPosition, version: 1 });
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { createRoomCategory: storeCreateRoomCategory } = roomCategoryStore;
    storeCreateRoomCategory({ name });
    const sentId = await promise;

    expect(roomCategories.value.map((roomCategory) => roomCategory.id)).toStrictEqual([sentId]);

    await flushPromises();

    expect(roomCategories.value.map(({ position, version }) => ({ position, version }))).toStrictEqual([
      { position: serverPosition, version: 1 },
    ]);
  });

  // A server-placed category has no position of its own while it waits, so it is listed after the rows the server holds
  test("lists a category the server has not answered for after the rows it holds", async () => {
    expect.hasAssertions();

    const { promise: isCreateSent, resolve: sendCreate } = Promise.withResolvers<void>();
    useSession.mockReturnValue(ref({ data: { user: { id: getMockSession().user.id } } }));
    const { promise: isCreateAnswered, resolve: answerCreate } = Promise.withResolvers<void>();
    trpcMsw.room.category.createRoomCategory.mutation(async ({ input }) => {
      sendCreate();
      await isCreateAnswered;
      return createRoomCategory(input);
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { arriveRoomCategories, createRoomCategory: storeCreateRoomCategory } = roomCategoryStore;
    arriveRoomCategories([createRoomCategory({ id, position: serverPosition })]);
    storeCreateRoomCategory({ name });
    await isCreateSent;

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toHaveLength(2);
    expect(roomCategories.value[0]?.id).toBe(id);

    answerCreate();
    await flushPromises();
  });

  test("drops a rejected create's placeholder and shows an error", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref({ data: { user: { id: getMockSession().user.id } } }));
    trpcMsw.room.category.createRoomCategory.mutation(() => {
      throw trpcError;
    });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { createRoomCategory: storeCreateRoomCategory } = roomCategoryStore;
    storeCreateRoomCategory({ name });
    await flushPromises();

    expect(roomCategories.value).toStrictEqual([]);
    expect(alerts.value).toHaveLength(1);
  });

  // The category leaves the list at once, and the tombstone the server answers with keeps it out: an older copy of the
  // Row that a read brings back later loses to the tombstone
  test("a deleted category leaves the list, and an older copy of it cannot bring it back", async () => {
    expect.hasAssertions();

    trpcMsw.room.category.deleteRoomCategory.mutation(({ input }) =>
      createRoomCategory({ deletedAt: new Date(), id: input, version: 1 }),
    );
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { arriveRoomCategories, deleteRoomCategory } = roomCategoryStore;
    arriveRoomCategories([createRoomCategory({ id })]);
    deleteRoomCategory(id);

    expect(roomCategories.value).toStrictEqual([]);

    await flushPromises();
    arriveRoomCategories([createRoomCategory({ id })]);

    expect(roomCategories.value).toStrictEqual([]);
  });

  test("a rejected delete puts the category back and shows an error", async () => {
    expect.hasAssertions();

    trpcMsw.room.category.deleteRoomCategory.mutation(() => {
      throw trpcError;
    });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { arriveRoomCategories, deleteRoomCategory } = roomCategoryStore;
    arriveRoomCategories([createRoomCategory({ id })]);
    deleteRoomCategory(id);
    await flushPromises();

    expect(roomCategories.value.map((roomCategory) => roomCategory.id)).toStrictEqual([id]);
    expect(alerts.value).toHaveLength(1);
  });

  // Each category is its own row, so a rejected deletion leaves the other one's removal where it stands
  test("restores only the category whose deletion was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.room.category.deleteRoomCategory.mutation(({ input }) => {
      if (input === id) throw trpcError;

      return createRoomCategory({ deletedAt: new Date(), id: input, version: 1 });
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { arriveRoomCategories, deleteRoomCategory } = roomCategoryStore;
    arriveRoomCategories([createRoomCategory({ id }), createRoomCategory({ id: otherId })]);
    deleteRoomCategory(id);
    deleteRoomCategory(otherId);
    await flushPromises();

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([id]);
  });

  test("shows a reorder's positions at once, and holds the rows the server answers with", async () => {
    expect.hasAssertions();

    const { promise: isReorderSent, resolve: sendReorder } = Promise.withResolvers<void>();
    trpcMsw.room.category.reorderRoomCategories.mutation(({ input }) => {
      sendReorder();
      return input.map(({ id: roomCategoryId, position }) =>
        createRoomCategory({ id: roomCategoryId, position, version: 1 }),
      );
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { arriveRoomCategories, reorderRoomCategories } = roomCategoryStore;
    const first = createRoomCategory({ id, position: 0 });
    const second = createRoomCategory({ id: otherId, position: 1 });
    arriveRoomCategories([first, second]);
    reorderRoomCategories([second, first]);

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([otherId, id]);

    await isReorderSent;
    await flushPromises();

    expect(roomCategories.value.map(({ position, version }) => ({ position, version }))).toStrictEqual([
      { position: 0, version: 1 },
      { position: 1, version: 1 },
    ]);
  });

  test("a rejected reorder restores the positions the rows held", async () => {
    expect.hasAssertions();

    trpcMsw.room.category.reorderRoomCategories.mutation(() => {
      throw trpcError;
    });
    const roomCategoryStore = useRoomCategoryStore();
    const { roomCategories } = storeToRefs(roomCategoryStore);
    const { arriveRoomCategories, reorderRoomCategories } = roomCategoryStore;
    const first = createRoomCategory({ id, position: 0 });
    const second = createRoomCategory({ id: otherId, position: 1 });
    arriveRoomCategories([first, second]);
    reorderRoomCategories([second, first]);
    await flushPromises();

    expect(roomCategories.value.map(({ id: roomCategoryId }) => roomCategoryId)).toStrictEqual([id, otherId]);
    expect(roomCategories.value.map(({ position }) => position)).toStrictEqual([0, 1]);
  });
});
