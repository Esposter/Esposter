import type { CreateRoomCategoryInput } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import type { DeleteRoomCategoryInput } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import type { UpdateRoomCategoryInput } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { authClient } from "@/services/auth/authClient";
import { getCategoryPositionUpdates } from "@/services/message/roomCategory/getCategoryPositionUpdates";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useRoomCategoryStore = defineStore("message/roomCategory", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateRoomCategoryMutation } = useMutation();
  const { executeMutation: executeDeleteRoomCategoryMutation } = useMutation();
  const { executeMutation: executeUpdateRoomCategoryMutation } = useMutation();
  const { executeMutation: executeReorderRoomCategoriesMutation } = useMutation();
  const categories = ref<RoomCategoryInMessage[]>([]);
  const {
    createRoomCategory: storeCreateRoomCategory,
    deleteRoomCategory: storeDeleteRoomCategory,
    updateRoomCategory: storeUpdateRoomCategory,
  } = createOperationData(categories, ["id"], DatabaseEntityType.RoomCategory);

  // The server only adds userId and the appended position, so the client can build the
  // Row faithfully — insert a temp-id placeholder now and reconcile the server row onto it in onSuccess.
  const createRoomCategory = async (input: CreateRoomCategoryInput) => {
    if (!session.value.data) return;

    // Reactive so the onSuccess Object.assign onto this same object triggers the list re-render
    const newCategory = reactive<RoomCategoryInMessage>({
      createdAt: new Date(),
      deletedAt: null,
      id: crypto.randomUUID(),
      name: input.name,
      // Mirror the server's append-below-existing-order position so the placeholder lands where the row will
      position: categories.value.reduce((maxPosition, { position }) => Math.max(maxPosition, position), -1) + 1,
      updatedAt: new Date(),
      userId: session.value.data.user.id,
    });
    await executeCreateRoomCategoryMutation(() => $trpc.room.category.createRoomCategory.mutate(input), {
      applyOptimistic: () => {
        storeCreateRoomCategory(newCategory);
        return () => {
          storeDeleteRoomCategory({ id: newCategory.id });
        };
      },
      // Each create owns a distinct placeholder with no server id yet, so it gets a per-call symbol
      key: Symbol("createRoomCategory"),
      // Reconcile onto the placeholder itself so it keeps its list position instead of being
      // Removed and re-appended under the server id
      onSuccess: (createdCategory) => {
        Object.assign(newCategory, createdCategory);
      },
    });
  };

  const deleteRoomCategory = async (id: DeleteRoomCategoryInput) => {
    await executeDeleteRoomCategoryMutation(() => $trpc.room.category.deleteRoomCategory.mutate(id), {
      // The one row this write removes, not a copy of the list: deletes are keyed per category and never queue
      // Against each other, so reinstating the list would resurrect a category another delete already took out
      // And drop the ones created while this write was in flight. Position drives the rendered order, so where
      // The restored row lands in the array is not observable
      applyOptimistic: () => {
        const deletedCategory = categories.value.find((category) => category.id === id);
        storeDeleteRoomCategory({ id });
        return () => {
          if (deletedCategory) storeCreateRoomCategory(deletedCategory);
        };
      },
      key: id,
    });
  };

  const updateRoomCategory = async (input: UpdateRoomCategoryInput) => {
    await executeUpdateRoomCategoryMutation(() => $trpc.room.category.updateRoomCategory.mutate(input), {
      applyOptimistic: () => {
        // Only the fields this write overwrites, on the one row it touches, and read as the write is sent:
        // A whole-list snapshot restored by reassignment would also undo whatever landed while this was queued
        // And swap every row for a copy, stranding the create placeholder its own onSuccess writes onto
        const previousCategory = categories.value.find(({ id }) => id === input.id);
        const rollbackCategory = previousCategory && { ...previousCategory };
        storeUpdateRoomCategory(input);
        return () => {
          if (rollbackCategory) storeUpdateRoomCategory(rollbackCategory);
        };
      },
      key: input.id,
      onSuccess: (updatedCategory) => {
        storeUpdateRoomCategory(updatedCategory);
      },
    });
  };

  const reorderRoomCategories = async (newCategories: RoomCategoryInMessage[]) => {
    const updates = getCategoryPositionUpdates(newCategories);
    if (updates.length === 0) return;
    await executeReorderRoomCategoriesMutation(() => $trpc.room.category.reorderRoomCategories.mutate(updates), {
      // Only the position of each row this write moves: restoring the list would swap every row for a copy —
      // Stranding the placeholder a concurrent create's onSuccess writes onto — and undo whatever else landed
      // While the reorder was in flight
      applyOptimistic: () => {
        const previousPositions = updates
          .map(({ id }) => categories.value.find((category) => category.id === id))
          .filter((category) => category !== undefined)
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

  return {
    categories,
    createRoomCategory,
    deleteRoomCategory,
    reorderRoomCategories,
    updateRoomCategory,
  };
});
