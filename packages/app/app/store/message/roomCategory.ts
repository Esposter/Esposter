import type { CreateRoomCategoryInput } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import type { DeleteRoomCategoryInput } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import type { UpdateRoomCategoryInput } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import type { RoomCategory } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useRoomCategoryStore = defineStore("message/roomCategory", () => {
  const { $trpc } = useNuxtApp();
  const categories = ref<RoomCategory[]>([]);
  const {
    createRoomCategory: storeCreateRoomCategory,
    deleteRoomCategory: storeDeleteRoomCategory,
    updateRoomCategory: storeUpdateRoomCategory,
  } = createOperationData(categories, ["id"], DatabaseEntityType.RoomCategory);

  const createRoomCategory = async (input: CreateRoomCategoryInput) => {
    const newCategory = await $trpc.roomCategory.createRoomCategory.mutate(input);
    storeCreateRoomCategory(newCategory);
    return newCategory;
  };

  const deleteRoomCategory = async (id: DeleteRoomCategoryInput) => {
    await $trpc.roomCategory.deleteRoomCategory.mutate(id);
    storeDeleteRoomCategory({ id });
  };

  const updateRoomCategory = async (input: UpdateRoomCategoryInput) => {
    const updatedCategory = await $trpc.roomCategory.updateRoomCategory.mutate(input);
    storeUpdateRoomCategory(updatedCategory);
    return updatedCategory;
  };

  return {
    categories,
    createRoomCategory,
    deleteRoomCategory,
    storeCreateRoomCategory,
    storeDeleteRoomCategory,
    storeUpdateRoomCategory,
    updateRoomCategory,
  };
});
