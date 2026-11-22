import { useArriveResourceListItems } from "#src/composables/resource/useArriveResourceListItems";
import { useFavoriteStore } from "#src/store/resource/favorite";

// The viewer's favorites a page at a time, the most recently set first. Each page's rows land on the overlay with their
// Stars, which is where the favorites list draws them from
export const useReadFavorites = () => {
  const { $trpc } = useNuxtApp();
  const arriveResourceListItems = useArriveResourceListItems();
  const favoriteStore = useFavoriteStore();
  const { readItems, readMoreItems } = favoriteStore;
  const isError = ref(false);
  const readFavoritePage = async (cursor: string) => {
    const page = await $trpc.resource.readFavorites.query({ cursor });
    arriveResourceListItems(page.items);
    return page;
  };
  const readFavorites = async () => {
    const read = await readItems(() => readFavoritePage(""));
    isError.value = read.isError.value;
  };
  const readMoreFavorites = (onComplete: () => void) => readMoreItems(readFavoritePage, onComplete);
  return { isError, readFavorites, readMoreFavorites };
};
