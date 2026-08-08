import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";

// One target, so every read of it supersedes the one before — the primitive's latest-wins, not a flag here
const FAVORITES_KEY = "favorites";

// Favorites are server-side from day one — a star that vanishes on another device reads as data loss
export const useFavoriteStore = defineStore("resource/favorite", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeToggleFavoriteMutation, executeQuery, getIsPending } = useMutation();
  const notificationStore = useNotificationStore();
  const favorites = ref<ResourceListItem[]>([]);
  // Every row on /all asks "am I starred?", so the lookup is a Set rather than a scan per row
  const favoriteIds = computed(() => new Set(favorites.value.map(({ id }) => id)));
  const isLoading = computed(() => getIsPending(FAVORITES_KEY));
  // Read-once-per-session, which single-flight cannot cover: a settled read is no longer in flight to join.
  // A failed read leaves this false so the next mount retries instead of caching the failure
  let isLoaded = false;
  const queryFavorites = async ({ isExclusive }: { isExclusive?: true } = {}) => {
    await executeQuery(() => $trpc.resource.readFavorites.query(), {
      isExclusive,
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

    await queryFavorites({ isExclusive: true });
  };
  // A delete or a restore changes which stars still point at a live resource, and only the server knows the
  // Resulting set. This re-reads rather than setting a dirty flag: issuing the read is what supersedes one
  // Already in flight, so the primitive drops the older response instead of this store tracking which is
  // Current. It never joins one either — the answer in flight is the one the invalidation just invalidated
  const refreshFavorites = async () => {
    isLoaded = false;
    await queryFavorites();
  };
  const toggleFavorite = async (resource: Resource) => {
    await executeToggleFavoriteMutation(() => $trpc.resource.toggleFavorite.mutate({ id: resource.id }), {
      // The snapshot is taken here rather than at click time, because this runs when the write is sent: a
      // Second click on one star queues behind the first, so a list captured at click time is the state from
      // Before the write ahead of it landed, and rolling back to it would leave the star reading a toggle stale
      applyOptimistic: () => {
        const snapshot = [...favorites.value];
        // The star can be clicked from the blade, where the row is a bare resource — the optimistic entry
        // Carries no last-access time of its own, and the next read replaces it with the joined one
        favorites.value = favoriteIds.value.has(resource.id)
          ? favorites.value.filter(({ id }) => id !== resource.id)
          : [{ lastAccessedAt: null, ...resource }, ...favorites.value];
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
          ? [{ lastAccessedAt: null, ...resource }, ...favorites.value.filter(({ id }) => id !== resource.id)]
          : favorites.value.filter(({ id }) => id !== resource.id);
      },
    });
  };
  return { favoriteIds, favorites, isLoading, readFavorites, refreshFavorites, toggleFavorite };
});
