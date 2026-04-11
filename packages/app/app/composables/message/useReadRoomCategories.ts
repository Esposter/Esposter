import { useRoomCategoryStore } from "@/store/message/roomCategory";

export const useReadRoomCategories = () => {
  const { $trpc } = useNuxtApp();
  const roomCategoryStore = useRoomCategoryStore();
  const { categories } = storeToRefs(roomCategoryStore);

  const readRoomCategories = async () => {
    const fetchedCategories = await $trpc.roomCategory.readRoomCategories.query();
    categories.value = fetchedCategories;
  };

  return { readRoomCategories };
};
