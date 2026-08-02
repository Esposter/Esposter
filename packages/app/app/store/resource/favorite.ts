import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";

// One target, so every read of it supersedes the one before — the primitive's latest-wins, not a flag here
const FAVORITES_KEY = "favorites";

// Favorites are server-side from day one — a star that vanishes on another device reads as data loss
export const useFavoriteStore = defineStore("resource/favorite", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeToggleFavoriteMutation, executeQuery, getIsPending } = useMutation();
  const notificationStore = useNotificationStore();
  const favorites = ref<Resource[]>([]);
  // Every row on /all asks "am I starred?", so the lookup is a Set rather than a scan per row
  const favoriteIds = computed(() => new Set(favorites.value.map(({ id }) => id)));
  const isLoading = computed(() => getIsPending(FAVORITES_KEY));
  // A failed read leaves this false so the next mount retries instead of caching the failure
  let isLoaded = false;
  let loadingPromise: Promise<void> | undefined;
  const queryFavorites = async () => {
    await executeQuery(() => $trpc.resource.readFavorites.query(), {
      key: FAVORITES_KEY,
      onError: (error) => {
        notificationStore.createNotification({ severity: "error", title: error.message });
      },
      onSuccess: (newFavorites) => {
        favorites.value = newFavorites;
        isLoaded = true;
      },
    });
  };
  // The workbench list, the blade page and Home all want the same MAX_READ_LIMIT joined rows, and the list
  // Mounts inside the blade — so the set is read once and two concurrent mounts share the in-flight query
  // Rather than every navigation re-running it. Anything that changes which stars resolve invalidates it
  const readFavorites = async () => {
    if (isLoaded) return;

    loadingPromise ??= queryFavorites().finally(() => {
      loadingPromise = undefined;
    });
    await loadingPromise;
  };
  // A delete or a restore changes which stars still point at a live resource, and only the server knows the
  // Resulting set. This re-reads rather than setting a dirty flag: issuing the read is what supersedes one
  // Already in flight, so the primitive drops the older response instead of this store tracking which is current
  const refreshFavorites = async () => {
    isLoaded = false;
    loadingPromise = undefined;
    await queryFavorites();
  };
  const toggleFavorite = async (resource: Resource) => {
    const snapshot = [...favorites.value];
    await executeToggleFavoriteMutation(() => $trpc.resource.toggleFavorite.mutate({ id: resource.id }), {
      applyOptimistic: () => {
        favorites.value = favoriteIds.value.has(resource.id)
          ? favorites.value.filter(({ id }) => id !== resource.id)
          : [resource, ...favorites.value];
        return () => {
          favorites.value = snapshot;
        };
      },
      key: resource.id,
      onError: (error) => {
        notificationStore.createNotification({ severity: "error", title: error.message });
      },
      // The toggle is a delete-then-insert against the row the server actually finds, so its answer is the
      // True post-toggle state. A list that went stale (another tab starred this first) flips the wrong way
      // Optimistically and nothing else reconciles it — the star would read starred here while being
      // Unstarred on every other device and after a reload
      onSuccess: (isFavorite) => {
        if (isFavorite === favoriteIds.value.has(resource.id)) return;

        favorites.value = isFavorite
          ? [resource, ...favorites.value.filter(({ id }) => id !== resource.id)]
          : favorites.value.filter(({ id }) => id !== resource.id);
      },
    });
  };
  return { favoriteIds, favorites, isLoading, readFavorites, refreshFavorites, toggleFavorite };
});
