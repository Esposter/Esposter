import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Resource } from "@esposter/db-schema";

import { CacheTag } from "@/models/cache/CacheTag";
import { useNotificationStore } from "@/store/notification";

// Favorites are server-side from day one — a star that vanishes on another device reads as data loss
export const useFavoriteStore = defineStore("resource/favorite", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeToggleFavoriteMutation } = useMutation();
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  const favorites = ref<ResourceListItem[]>([]);
  // Every row on /all asks "am I starred?", so the lookup is a Set rather than a scan per row
  const favoriteIds = computed(() => new Set(favorites.value.map(({ id }) => id)));
  // The workbench list, the blade page and Home all want the same MAX_READ_LIMIT joined rows, and the list
  // Mounts inside the blade — so the set is read once and two concurrent mounts share the in-flight query
  // Rather than every navigation re-running it
  const { isPending, read: readFavorites } = useCachedRead(() => $trpc.resource.readFavorites.query(), {
    // The one cache that cannot wait for its next mount: the stars are rendered in the very table a delete is
    // Issued from, so the set has to be correct on screen the moment the write lands
    isRefetchOnInvalidate: true,
    onError: createErrorNotification,
    onSuccess: (newFavorites) => {
      favorites.value = newFavorites;
    },
    // A delete, restore or purge changes which stars still point at a live resource, and the list is capped at
    // MAX_READ_LIMIT — only the server knows which row backfills the one that left, so it is re-read, not edited
    tags: [CacheTag.Resources],
  });
  const toggleFavorite = async (resource: Resource) => {
    await executeToggleFavoriteMutation(() => $trpc.resource.toggleFavorite.mutate({ id: resource.id }), {
      // The entry is read here rather than at click time, because this runs when the write is sent: a second
      // Click on one star queues behind the first, so a state captured at click time is the one from before the
      // Write ahead of it landed, and rolling back to it would leave the star reading a toggle stale
      applyOptimistic: () => {
        const previousFavorite = favorites.value.find(({ id }) => id === resource.id);
        // The star can be clicked from the blade, where the row is a bare resource — the optimistic entry
        // Carries no last-access time of its own, and the next read replaces it with the joined one
        favorites.value = previousFavorite
          ? favorites.value.filter(({ id }) => id !== resource.id)
          : [{ lastAccessedAt: null, ...resource }, ...favorites.value];
        return () => {
          // Only this resource's own entry is unwound: stars of different resources do not queue against each
          // Other, and the cached read replaces the list wholesale. A restored entry returning to the front
          // Rather than its read order is the cosmetic price
          favorites.value = previousFavorite
            ? [previousFavorite, ...favorites.value.filter(({ id }) => id !== resource.id)]
            : favorites.value.filter(({ id }) => id !== resource.id);
        };
      },
      key: resource.id,
      onError: createErrorNotification,
      // The toggle is a delete-then-insert against the row the server actually finds, so its answer is the
      // True post-toggle state. A list that went stale (another tab starred this first) flips the wrong way
      // Optimistically and nothing else reconciles it — the star would read starred here while being
      // Unstarred on every other device and after a reload
      onSuccess: (isFavorite) => {
        if (isFavorite === favoriteIds.value.has(resource.id)) return;

        const remainingFavorites = favorites.value.filter(({ id }) => id !== resource.id);
        favorites.value = isFavorite
          ? [{ lastAccessedAt: null, ...resource }, ...remainingFavorites]
          : remainingFavorites;
      },
    });
  };
  return { favoriteIds, favorites, isPending, readFavorites, toggleFavorite };
});
