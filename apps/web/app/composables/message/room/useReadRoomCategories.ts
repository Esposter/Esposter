import { useRoomCategoryStore } from "#src/store/message/roomCategory";
import { getResultAsync } from "@esposter/shared";

export const useReadRoomCategories = () => {
  const { $trpc } = useNuxtApp();
  const roomCategoryStore = useRoomCategoryStore();
  const { arriveRoomCategories } = roomCategoryStore;
  // Whether the last read failed, so the list says so rather than reading as having no categories. A retry clears it
  const isError = ref(false);
  // Recorded rather than thrown, so the setup that awaits the read never fails on it and a retry is a plain call
  const readRoomCategories = async () => {
    isError.value = false;
    await getResultAsync(() => $trpc.room.category.readRoomCategories.query()).match(
      (roomCategories) => {
        arriveRoomCategories(roomCategories);
      },
      () => {
        isError.value = true;
      },
    );
  };
  return { isError, readRoomCategories };
};
