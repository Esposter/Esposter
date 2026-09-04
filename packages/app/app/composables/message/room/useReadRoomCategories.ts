import { useRoomCategoryStore } from "@/store/message/roomCategory";

export const useReadRoomCategories = () => {
  const { $trpc } = useNuxtApp();
  const roomCategoryStore = useRoomCategoryStore();
  const { roomCategories } = storeToRefs(roomCategoryStore);
  return async () => {
    roomCategories.value = await $trpc.room.category.readRoomCategories.query();
  };
};
