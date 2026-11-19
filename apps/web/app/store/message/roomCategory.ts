import type { CreateRoomCategoryInput } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import type { DeleteRoomCategoryInput } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { authClient } from "#src/services/auth/authClient";
import { getRoomCategoryPositionUpdates } from "#src/services/message/roomCategory/getRoomCategoryPositionUpdates";
import { createOperationData } from "#src/services/shared/createOperationData";
import { DatabaseEntityType, NO_ROW_VERSION } from "@esposter/db-schema";
import { v7 } from "uuid";

export const useRoomCategoryStore = defineStore("message/roomCategory", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  // One executor for every room category write: a queue lives per key within an executor, so creates and reorders
  // Share the list's key to queue behind each other
  const { executeMutation } = useMutation();
  const roomCategoryListKey = "roomCategoryList";
  const roomCategories = ref<RoomCategoryInMessage[]>([]);
  const {
    createRoomCategory: storeCreateRoomCategory,
    deleteRoomCategory: storeDeleteRoomCategory,
    updateRoomCategory: storeUpdateRoomCategory,
  } = createOperationData(roomCategories, ["id"], DatabaseEntityType.RoomCategory);
  // The category is created under the id the client gives it, and the server only adds userId and the appended
  // Position, so the row drawn now is the row the server stores
  const createRoomCategory = (input: Except<CreateRoomCategoryInput, "id">) => {
    if (!session.value.data) return;
    const newRoomCategory: RoomCategoryInMessage = {
      version: NO_ROW_VERSION,
      createdAt: new Date(),
      deletedAt: null,
      id: v7(),
      name: input.name,
      // Mirror the server's append-below-existing-order position, so the row is drawn where the server places it
      position: roomCategories.value.reduce((maxPosition, { position }) => Math.max(maxPosition, position), -1) + 1,
      updatedAt: new Date(),
      userId: session.value.data.user.id,
    };
    executeMutation(() => $trpc.room.category.createRoomCategory.mutate({ ...input, id: newRoomCategory.id }), {
      applyOptimistic: () => {
        storeCreateRoomCategory(newRoomCategory);
        return () => {
          storeDeleteRoomCategory({ id: newRoomCategory.id });
        };
      },
      // Creates queue on the list, since each is appended below the last the server stored and two at once would tie
      key: roomCategoryListKey,
      // The position the server appended at is the one the next read sorts by
      reconcile: (createdRoomCategory) => {
        storeUpdateRoomCategory(createdRoomCategory);
      },
    });
  };

  const deleteRoomCategory = (id: DeleteRoomCategoryInput) => {
    executeMutation(() => $trpc.room.category.deleteRoomCategory.mutate(id), {
      // Deletes are keyed per room category and never queue against each other. Position drives the rendered
      // Order, so where the restored row lands in the array is not observable
      applyOptimistic: () => {
        const deletedRoomCategory = roomCategories.value.find((roomCategory) => roomCategory.id === id);
        storeDeleteRoomCategory({ id });
        return () => {
          if (deletedRoomCategory) storeCreateRoomCategory(deletedRoomCategory);
        };
      },
      key: id,
    });
  };

  const reorderRoomCategories = (newRoomCategories: RoomCategoryInMessage[]) => {
    const updates = getRoomCategoryPositionUpdates(newRoomCategories);
    if (updates.length === 0) return;
    executeMutation(() => $trpc.room.category.reorderRoomCategories.mutate(updates), {
      // Only the position of each row this write moves, so a row a concurrent create or event added is left as it is
      applyOptimistic: () => {
        const previousPositions = updates
          .map(({ id }) => roomCategories.value.find((roomCategory) => roomCategory.id === id))
          .filter((roomCategory) => roomCategory !== undefined)
          .map(({ id, position }) => ({ id, position }));
        for (const update of updates) storeUpdateRoomCategory(update);
        return () => {
          for (const previousPosition of previousPositions) storeUpdateRoomCategory(previousPosition);
        };
      },
      // The whole list is the target, so it shares the list's key: a reorder waits for a create in flight, and a create
      // Waits for a reorder, since both write the positions the other one reads
      key: roomCategoryListKey,
    });
  };

  return { createRoomCategory, deleteRoomCategory, reorderRoomCategories, roomCategories };
});
