import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";
import type { Except } from "type-fest";

import { getConcurrentFunction } from "#shared/util/function/getConcurrentFunction";
import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";
import { getResultAsync } from "@esposter/shared";
// The summary cards read every filter except `types` — the cards are what sets it, so grouping by a type
// The user already narrowed to would only ever render the one card they are standing on
export const useReadResourceTypeCounts = (getFilters: () => Except<ResourceFilterValues, "types">) => {
  const { $trpc } = useNuxtApp();
  const counts = ref<ResourceTypeCount[]>([]);
  const isLoading = ref(false);
  const error = ref("");
  const refresh = getConcurrentFunction(async (checkIsStale) => {
    // Shared with the list so a card's count is the number the list shows once the card sets its type
    const filterInput = getResourceFilterInput({ ...getFilters(), types: [] });
    isLoading.value = true;
    error.value = "";
    await getResultAsync(() => $trpc.resource.countsByType.query(filterInput)).match(
      (newCounts) => {
        if (!checkIsStale()) counts.value = newCounts;
      },
      (readError) => {
        if (!checkIsStale()) error.value = readError.message;
      },
    );
    if (!checkIsStale()) isLoading.value = false;
  });
  return { counts, error, isLoading, refresh };
};
