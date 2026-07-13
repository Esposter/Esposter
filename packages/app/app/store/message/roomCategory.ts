import type { CreateRoomCategoryInput } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import type { DeleteRoomCategoryInput } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import type { UpdateRoomCategoryInput } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { getCategoryPositionUpdates } from "@/services/message/roomCategory/getCategoryPositionUpdates";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useRoomCategoryStore = defineStore("message/roomCategory", () => {
  const { $trpc } = useNuxtApp();
  const executeMutation = useMutation();
  const categories = ref<RoomCategoryInMessage[]>([]);
  const {
    createRoomCategory: storeCreateRoomCategory,
    deleteRoomCategory: storeDeleteRoomCategory,
    updateRoomCategory: storeUpdateRoomCategory,
  } = createOperationData(categories, ["id"], DatabaseEntityType.RoomCategory);

  // Server-generated category — non-optimistic, applied in onSuccess
  const createRoomCategory = async (input: CreateRoomCategoryInput) => {
    await executeMutation(() => $trpc.room.category.createRoomCategory.mutate(input), {
      onSuccess: (newCategory) => {
        storeCreateRoomCategory(newCategory);
      },
    });
  };

  const deleteRoomCategory = async (id: DeleteRoomCategoryInput) => {
    const snapshot = [...categories.value];
    await executeMutation(() => $trpc.room.category.deleteRoomCategory.mutate(id), {
      applyOptimistic: () => {
        storeDeleteRoomCategory({ id });
        return () => {
          categories.value = snapshot;
        };
      },
    });
  };

  const updateRoomCategory = async (input: UpdateRoomCategoryInput) => {
    const snapshot = categories.value.map((category) => ({ ...category }));
    await executeMutation(() => $trpc.room.category.updateRoomCategory.mutate(input), {
      applyOptimistic: () => {
        storeUpdateRoomCategory(input);
        return () => {
          categories.value = snapshot;
        };
      },
      onSuccess: (updatedCategory) => {
        storeUpdateRoomCategory(updatedCategory);
      },
    });
  };

  const reorderRoomCategories = async (newCategories: RoomCategoryInMessage[]) => {
    const updates = getCategoryPositionUpdates(newCategories);
    if (updates.length === 0) return;
    await executeMutation(() => $trpc.room.category.reorderRoomCategories.mutate(updates), {
      applyOptimistic: () => {
        const snapshot = categories.value.map((category) => ({ ...category }));
        for (const update of updates) storeUpdateRoomCategory(update);
        return () => {
          categories.value = snapshot;
        };
      },
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
