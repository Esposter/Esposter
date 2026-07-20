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
    const snapshot = [...categories.value];
    await executeDeleteRoomCategoryMutation(() => $trpc.room.category.deleteRoomCategory.mutate(id), {
      applyOptimistic: () => {
        storeDeleteRoomCategory({ id });
        return () => {
          categories.value = snapshot;
        };
      },
      key: id,
    });
  };

  const updateRoomCategory = async (input: UpdateRoomCategoryInput) => {
    const snapshot = categories.value.map((category) => ({ ...category }));
    await executeUpdateRoomCategoryMutation(() => $trpc.room.category.updateRoomCategory.mutate(input), {
      applyOptimistic: () => {
        storeUpdateRoomCategory(input);
        return () => {
          categories.value = snapshot;
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
      applyOptimistic: () => {
        const snapshot = categories.value.map((category) => ({ ...category }));
        for (const update of updates) storeUpdateRoomCategory(update);
        return () => {
          categories.value = snapshot;
        };
      },
      // A stable key so the latest whole-list reorder supersedes any in-flight one
      key: "reorderRoomCategories",
    });
  };

  return {
    categories,
    createRoomCategory,
    deleteRoomCategory,
    reorderRoomCategories,
    storeCreateRoomCategory,
    storeDeleteRoomCategory,
    storeUpdateRoomCategory,
    updateRoomCategory,
  };
});
