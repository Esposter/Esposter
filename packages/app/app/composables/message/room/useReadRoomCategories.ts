import { useRoomCategoryStore } from "@/store/message/roomCategory";

export const useReadRoomCategories = () => {
  const { $trpc } = useNuxtApp();
  const roomCategoryStore = useRoomCategoryStore();
  const { categories } = storeToRefs(roomCategoryStore);
  const readRoomCategories = async () => {
    categories.value = await $trpc.roomCategory.readRoomCategories.query();
  };
  return { readRoomCategories };
};
