import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";
import { getResultAsync } from "@esposter/shared";

// Favorites are server-side from day one — a star that vanishes on another device reads as data loss
export const useFavoriteStore = defineStore("resource/favorite", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeToggleFavoriteMutation } = useMutation();
  const notificationStore = useNotificationStore();
  const favorites = ref<Resource[]>([]);
  // Every row on /all asks "am I starred?", so the lookup is a Set rather than a scan per row
  const favoriteIds = computed(() => new Set(favorites.value.map(({ id }) => id)));
  const isLoading = ref(false);
  // A failed read leaves this false so the next mount retries instead of caching the failure
  let isLoaded = false;
  let loadingPromise: Promise<void> | undefined;
  // Bumped by every invalidation, so a read that was already in flight when the set changed cannot apply its
  // Now-stale rows or mark them loaded — the delete that invalidated it is exactly what its rows predate
  let readGeneration = 0;
  const queryFavorites = async () => {
    const generation = readGeneration;
    isLoading.value = true;
    await getResultAsync(() => $trpc.resource.readFavorites.query()).match(
      (newFavorites) => {
        if (generation !== readGeneration) return;

        favorites.value = newFavorites;
        isLoaded = true;
      },
      (error) => {
        notificationStore.createNotification({ severity: "error", title: error.message });
      },
    );
    isLoading.value = false;
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
  // Resulting set, so the next surface to mount re-reads it
  const invalidateFavorites = () => {
    isLoaded = false;
    readGeneration++;
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
  return { favoriteIds, favorites, invalidateFavorites, isLoading, readFavorites, toggleFavorite };
});
