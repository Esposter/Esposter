import type { CreateRoomCategoryInput } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import type { DeleteRoomCategoryInput } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import type { UpdateRoomCategoryInput } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { getRoomCategoryPositionUpdates } from "@/services/message/roomCategory/getRoomCategoryPositionUpdates";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

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
  // The server only adds userId and the appended position, so the client can build the
  // Row faithfully — insert a temp-id placeholder now and reconcile the server row onto it in onSuccess.
  const createRoomCategory = async (input: CreateRoomCategoryInput) => {
    if (!session.value.data) return;
    // Reactive so the onSuccess Object.assign onto this same object triggers the list re-render
    const newRoomCategory = reactive<RoomCategoryInMessage>({
      createdAt: new Date(),
      deletedAt: null,
      id: crypto.randomUUID(),
      name: input.name,
      // Mirror the server's append-below-existing-order position so the placeholder lands where the row will
      position: roomCategories.value.reduce((maxPosition, { position }) => Math.max(maxPosition, position), -1) + 1,
      updatedAt: new Date(),
      userId: session.value.data.user.id,
    });
    await executeCreateRoomCategoryMutation(() => $trpc.room.category.createRoomCategory.mutate(input), {
      applyOptimistic: () => {
        storeCreateRoomCategory(newRoomCategory);
        return () => {
          storeDeleteRoomCategory({ id: newRoomCategory.id });
        };
      },
      key: Symbol("createRoomCategory"),
      // Reconcile onto the placeholder itself so it keeps its list position instead of being
      // Removed and re-appended under the server id
      onSuccess: (createdRoomCategory) => {
        Object.assign(newRoomCategory, createdRoomCategory);
      },
    });
  };

  const deleteRoomCategory = async (id: DeleteRoomCategoryInput) => {
    await executeDeleteRoomCategoryMutation(() => $trpc.room.category.deleteRoomCategory.mutate(id), {
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

  const updateRoomCategory = async (input: UpdateRoomCategoryInput) => {
    await executeUpdateRoomCategoryMutation(() => $trpc.room.category.updateRoomCategory.mutate(input), {
      applyOptimistic: () => {
        // Only the fields this write overwrites, on the one row it touches, and read as the write is sent —
        // Swapping a row for a copy would strand the create placeholder its own onSuccess writes onto
        const previousRoomCategory = roomCategories.value.find(({ id }) => id === input.id);
        const rollbackRoomCategory = previousRoomCategory && { ...previousRoomCategory };
        storeUpdateRoomCategory(input);
        return () => {
          if (rollbackRoomCategory) storeUpdateRoomCategory(rollbackRoomCategory);
        };
      },
      key: input.id,
      onSuccess: (updatedRoomCategory) => {
        storeUpdateRoomCategory(updatedRoomCategory);
      },
    });
  };

  const reorderRoomCategories = async (newRoomCategories: RoomCategoryInMessage[]) => {
    const updates = getRoomCategoryPositionUpdates(newRoomCategories);
    if (updates.length === 0) return;
    await executeReorderRoomCategoriesMutation(() => $trpc.room.category.reorderRoomCategories.mutate(updates), {
      // Only the position of each row this write moves — swapping a row for a copy would strand the placeholder
      // A concurrent create's onSuccess writes onto
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

  return {
    createRoomCategory,
    deleteRoomCategory,
    reorderRoomCategories,
    roomCategories,
    updateRoomCategory,
  };
});
