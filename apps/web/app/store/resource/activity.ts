import type { ResourceActivityEntity } from "@esposter/db-schema";

import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useActivityStore = defineStore("resource/activity", () => {
  const router = useRouter();
  const currentResourceId = computed(() => getRouteParamString(router.currentRoute.value.params.id));
  // Activity is per resource, so the slice is keyed by the resource it describes. Held as one global slice, the
  // Rows, `hasMore` and the cursor all still answer for the previous resource between the next blade mounting
  // And its own read landing — and the cursor is the dangerous one, since paging then appends that resource's
  // Next page onto this one's list
  const { hasMore, items, readItems, readMoreItems } =
    useCursorPaginationDataMap<ResourceActivityEntity>(currentResourceId);

  return { hasMore, items, readItems, readMoreItems };
});
