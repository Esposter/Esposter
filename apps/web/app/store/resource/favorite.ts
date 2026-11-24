import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListItemWithFavorite } from "#shared/models/resource/ResourceListItemWithFavorite";
import type { ResourceInResource } from "@esposter/db-schema";

import { favoriteTable, resourceTable } from "#src/services/resource/overlay/constants";
import { getHeldResource } from "#src/services/resource/overlay/getHeldResource";
import { getToggleFavoriteEntry } from "#src/services/resource/overlay/getToggleFavoriteEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";

// Favorites are server-side from day one — a star that vanishes on another device reads as data loss. A star is a row
// On the overlay. Every resource read answers each of its rows with the viewer's star, which lands beside the row, so a
// Row shows its star wherever it is listed, and the favorites list is a page of the starred rows, drawn from the
// Overlay like any list
export const useFavoriteStore = defineStore("resource/favorite", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { view, writeOptimistic } = overlayStore;
  const favoriteRows = view(favoriteTable);
  const resourceRows = view(resourceTable);
  const notificationStore = useNotificationStore();
  const { createErrorNotification } = notificationStore;
  // Every row asks "am I starred?", so the lookup is a Set rather than a scan per row. A star set on screen is starred
  // Before any read has answered it
  const favoriteIds = computed(() => new Set(favoriteRows.value.map(({ resourceId }) => resourceId)));
  // The favorites list is the ids its pages named, each drawn from the overlay: a star removed here or elsewhere, or a
  // Resource deleted, leaves the list at once, whichever page named it
  const {
    hasMore,
    isLoaded,
    items: favoritePageItems,
    readItems,
    readMoreItems,
  } = useCursorPaginationData<ResourceListItemWithFavorite>();
  const favorites = computed<ResourceListItem[]>(() =>
    favoritePageItems.value.flatMap(({ id, lastAccessedAt }) => {
      const resource = getHeldResource(resourceRows.value, id);
      return resource && favoriteIds.value.has(id) ? [{ ...resource, lastAccessedAt }] : [];
    }),
  );
  // A star is set or removed where it is drawn, and the write it sends answers the star's row at its version
  const toggleFavorite = (resource: ResourceInResource) => {
    writeOptimistic(
      async () => createRowResponse(favoriteTable, await $trpc.resource.toggleFavorite.mutate({ id: resource.id })),
      { entry: getToggleFavoriteEntry(userId.value, resource.id, new Date()), onError: createErrorNotification },
    );
  };
  return { favoriteIds, favorites, hasMore, isLoaded, readItems, readMoreItems, toggleFavorite };
});
