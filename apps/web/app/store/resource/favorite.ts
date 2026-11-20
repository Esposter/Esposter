import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceInResource } from "@esposter/db-schema";

import { CacheTag } from "#src/models/cache/CacheTag";
import { favoriteTable } from "#src/services/resource/overlay/constants";
import { getToggleFavoriteEntry } from "#src/services/resource/overlay/getToggleFavoriteEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";

// Favorites are server-side from day one — a star that vanishes on another device reads as data loss. A star is a row on the
// Overlay, and the resource it stars is the one the read joined, kept by id beside it
export const useFavoriteStore = defineStore("resource/favorite", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const favoriteRows = view(favoriteTable);
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  // The resource each read joined to a star, by id. Each read replaces it, so a star whose resource no read holds shows nothing
  const resources = ref(new Map<string, ResourceListItem>());
  // The stars that are set, the newest first, each with the resource it stars once a read has joined one
  const favorites = computed(() =>
    favoriteRows.value
      .toSorted(
        (firstFavorite, secondFavorite) => secondFavorite.createdAt.getTime() - firstFavorite.createdAt.getTime(),
      )
      .flatMap(({ resourceId }) => {
        const resource = resources.value.get(resourceId);
        return resource ? [resource] : [];
      }),
  );
  // Every row on /all asks "am I starred?", so the lookup is a Set rather than a scan per row. A star set on screen is
  // Starred before any read has joined its resource
  const favoriteIds = computed(() => new Set(favoriteRows.value.map(({ resourceId }) => resourceId)));
  // Whether any read has settled, success or failure — before one has, an empty list is not yet an answer
  const isReadSettled = ref(false);
  // The workbench list, the blade page and Home all want the same MAX_READ_LIMIT joined rows, and the list
  // Mounts inside the blade — so the set is read once and two concurrent mounts share the in-flight query
  // Rather than every navigation re-running it
  const { isPending, read: readFavorites } = useCachedRead(() => $trpc.resource.readFavorites.query(), {
    // The one cache that cannot wait for its next mount: the stars are rendered in the very table a delete is
    // Issued from, so the set has to be correct on screen the moment the write lands
    isRefetchOnInvalidate: true,
    onError: (error) => {
      isReadSettled.value = true;
      createErrorNotification(error);
    },
    onSuccess: (newFavorites) => {
      // A removed star comes back as a tombstone, which the arrival keeps over an older copy of the star
      for (const { favorite } of newFavorites) arrive(favoriteTable, favorite);
      resources.value = new Map(newFavorites.map(({ resource }) => [resource.id, resource]));
      isReadSettled.value = true;
    },
    // A delete, restore or purge changes which stars still point at a live resource, and the list is capped at
    // MAX_READ_LIMIT — only the server knows which row backfills the one that left, so it is re-read, not edited
    tags: [CacheTag.Resources],
  });
  // A star is set or removed where it is drawn, and the write it sends answers the star's row at its version
  const toggleFavorite = (resource: ResourceInResource) => {
    writeOptimistic(
      async () => createRowResponse(favoriteTable, await $trpc.resource.toggleFavorite.mutate({ id: resource.id })),
      { entry: getToggleFavoriteEntry(userId.value, resource.id, new Date()), onError: createErrorNotification },
    );
  };
  return { favoriteIds, favorites, isPending, isReadSettled, readFavorites, toggleFavorite };
});
