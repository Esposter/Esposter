import { useRoomCategoryStore } from "@/store/message/roomCategory";

export const useReadRoomCategories = () => {
  const { $trpc } = useNuxtApp();
  const roomCategoryStore = useRoomCategoryStore();
  const { categories } = storeToRefs(roomCategoryStore);
  return async () => {
    categories.value = await $trpc.room.category.readRoomCategories.query();
  };
};
