import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { useArriveResourceListItems } from "#src/composables/resource/useArriveResourceListItems";
import { CacheTag } from "#src/models/cache/CacheTag";
import { ResourceListSource } from "#src/models/resource/list/ResourceListSource";
import { RECENT_RESOURCES_LIMIT } from "#src/services/resource/constants";
import { getResourceListSortName } from "#src/services/resource/list/getResourceListSortName";
import { ResourceListSourceDefinitionMap } from "#src/services/resource/list/ResourceListSourceDefinitionMap";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { getHeldResource } from "#src/services/resource/overlay/getHeldResource";
import { useOverlayStore } from "#src/store/overlay";

// Recent means recently *opened*, and the set is the caller's own server-side access rows, so it follows them
// Between devices. Home's Recent tab and the palette's resources scope both want the same capped list: the tab mounts
// On the explorer home page and the palette on every page, so the set is read once and two concurrent mounts share the
// In-flight query rather than each issuing the same request. The list is the ids a read gave, in its order, over the
// Resource rows the overlay holds, so a resource that is deleted drops out of it without a re-read
export const useRecentStore = defineStore("resource/recent", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { view } = overlayStore;
  const resourceRows = view(resourceTable);
  const arriveResourceListItems = useArriveResourceListItems();
  const recentIds = ref<string[]>([]);
  // The last access each read joined, by resource id, which each read replaces. It is the access row's, not the
  // Resource's, so it is held beside the resource rows rather than on them
  const lastAccessedAts = ref(new Map<string, ResourceListItem["lastAccessedAt"]>());
  // A deleted resource's row is held as a tombstone, so it drops out of the list here without a re-read
  const recents = computed(() =>
    recentIds.value.flatMap((id) => {
      const resource = getHeldResource(resourceRows.value, id);
      return resource && !resource.deletedAt
        ? [{ ...resource, lastAccessedAt: lastAccessedAts.value.get(id) ?? null }]
        : [];
    }),
  );
  const error = ref("");
  // Whether any read has settled, success or failure — before one has, an empty list is not yet an answer
  const isReadSettled = ref(false);
  const { isPending, read: readRecents } = useCachedRead(
    () => {
      // Taken from the source registry rather than restated, so what Recent means is one edit everywhere
      const { filter, sortBy } = ResourceListSourceDefinitionMap[ResourceListSource.Recents];
      return $trpc.resource.readResources.query({
        ...filter,
        limit: RECENT_RESOURCES_LIMIT,
        sortName: getResourceListSortName(sortBy, filter),
      });
    },
    {
      // Surfaced in Home's Recent tab as an error state with its own retry rather than a toast: the tab is the only
      // Thing that failed, and it has the room to say so
      onError: (readError) => {
        error.value = readError.message;
        isReadSettled.value = true;
      },
      onSuccess: ({ items }) => {
        arriveResourceListItems(items);
        recentIds.value = items.map(({ id }) => id);
        lastAccessedAts.value = new Map(items.map(({ id, lastAccessedAt }) => [id, lastAccessedAt] as const));
        error.value = "";
        isReadSettled.value = true;
      },
      // Recents for the visit that reorders the list, Resources because a delete or a restore changes which of
      // Its rows still resolve. Neither moment has anything showing the list mounted — you are on the resource
      // Itself, or on the workbench table — so this drops and Home's Recent tab issues the read on its next mount
      tags: [CacheTag.Recents, CacheTag.Resources],
    },
  );
  return { error, isPending, isReadSettled, readRecents, recents };
});
