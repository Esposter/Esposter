import type { ResourceActivityEntity } from "@esposter/db-schema";

import { getRouteParam } from "@/util/router/getRouteParam";

export const useActivityStore = defineStore("resource/activity", () => {
  const router = useRouter();
  const currentResourceId = computed(() => getRouteParam(router.currentRoute.value.params, "id"));
  // Activity is per resource, so the slice is keyed by the resource it describes. Held as one global slice, the
  // Rows, `hasMore` and the cursor all still answer for the previous resource between the next blade mounting
  // And its own read landing — and the cursor is the dangerous one, since paging then appends that resource's
  // Next page onto this one's list
  const { hasMore, items, readItems, readMoreItems } =
    useCursorPaginationDataMap<ResourceActivityEntity>(currentResourceId);

  return { hasMore, items, readItems, readMoreItems };
});
