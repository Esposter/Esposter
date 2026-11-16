import type { CreateRoomCategoryInput } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import type { DeleteRoomCategoryInput } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import type { UpdateRoomCategoryInput } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { authClient } from "#src/services/auth/authClient";
import { getRoomCategoryPositionUpdates } from "#src/services/message/roomCategory/getRoomCategoryPositionUpdates";
import { createOperationData } from "#src/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";
import { v7 } from "uuid";

export const useRoomCategoryStore = defineStore("message/roomCategory", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateRoomCategoryMutation } = useMutation();
  const { executeMutation: executeDeleteRoomCategoryMutation } = useMutation();
  const { executeMutation: executeUpdateRoomCategoryMutation } = useMutation();
  const { executeMutation: executeReorderRoomCategoriesMutation } = useMutation();
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
      createdAt: new Date(),
      deletedAt: null,
      id: v7(),
      name: input.name,
      // Mirror the server's append-below-existing-order position, so the row is drawn where the server places it
      position: roomCategories.value.reduce((maxPosition, { position }) => Math.max(maxPosition, position), -1) + 1,
      updatedAt: new Date(),
      userId: session.value.data.user.id,
    };
    executeCreateRoomCategoryMutation(
      () => $trpc.room.category.createRoomCategory.mutate({ ...input, id: newRoomCategory.id }),
      {
        applyOptimistic: () => {
          storeCreateRoomCategory(newRoomCategory);
          return () => {
            storeDeleteRoomCategory({ id: newRoomCategory.id });
          };
        },
        // Creates queue, since each is appended below the last the server stored and two at once would tie
        key: "createRoomCategory",
        // The position the server appended at is the one the next read sorts by
        reconcile: (createdRoomCategory) => {
          storeUpdateRoomCategory(createdRoomCategory);
        },
      },
    );
  };

  const deleteRoomCategory = (id: DeleteRoomCategoryInput) => {
    executeDeleteRoomCategoryMutation(() => $trpc.room.category.deleteRoomCategory.mutate(id), {
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

  const updateRoomCategory = (input: UpdateRoomCategoryInput) => {
    executeUpdateRoomCategoryMutation(() => $trpc.room.category.updateRoomCategory.mutate(input), {
      applyOptimistic: () => {
        // Only the fields this write names, on the one row it touches, and read as the write is sent. A field the
        // Write does not name belongs to another write (a reorder moves position), so a rollback must not restore it
        const previousRoomCategory = roomCategories.value.find(({ id }) => id === input.id);
        const rollbackRoomCategory = previousRoomCategory && {
          id: previousRoomCategory.id,
          ...(input.name !== undefined && { name: previousRoomCategory.name }),
          ...(input.position !== undefined && { position: previousRoomCategory.position }),
        };
        storeUpdateRoomCategory(input);
        return () => {
          if (rollbackRoomCategory) storeUpdateRoomCategory(rollbackRoomCategory);
        };
      },
      key: input.id,
      reconcile: (updatedRoomCategory) => {
        storeUpdateRoomCategory(updatedRoomCategory);
      },
    });
  };

  const reorderRoomCategories = (newRoomCategories: RoomCategoryInMessage[]) => {
    const updates = getRoomCategoryPositionUpdates(newRoomCategories);
    if (updates.length === 0) return;
    executeReorderRoomCategoriesMutation(() => $trpc.room.category.reorderRoomCategories.mutate(updates), {
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
      // The whole list is the target, so a stable key: reorders run one after the other against it
      key: "reorderRoomCategories",
    });
  };

  return { createRoomCategory, deleteRoomCategory, reorderRoomCategories, roomCategories, updateRoomCategory };
});
