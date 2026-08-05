import { useFavoriteStore } from "@/store/resource/favorite";

// A delete, restore or purge changes which resources are live, and a star only resolves while its resource is.
// Both sides are re-read together here so no caller can reconcile the table and leave Home's Favorites listing
// Rows whose resource is gone: the favorite set is read once per session, so nothing else corrects it until a
// Reload, and opening one of those rows lands on a blade whose read rejects
export const useRefreshResources = (refresh: () => Promise<void>) => {
  const favoriteStore = useFavoriteStore();
  const { refreshFavorites } = favoriteStore;
  const refreshResources = async () => {
    await refreshFavorites();
    await refresh();
  };
  return { refreshFavorites, refreshResources };
};
