import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceListFilters } from "@/models/resource/list/ResourceListFilters";
import type { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import type { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import type { Except } from "type-fest";

import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";
import { getResultAsync } from "@esposter/shared";
// The summary cards read every filter except `types` — the cards are what sets it, so grouping by a type
// The user already narrowed to would only ever render the one card they are standing on
export const useReadResourceTypeCounts = ({
  searchQuery = ref(""),
  status = ref<"" | ResourceStatusFilter>(""),
  updatedAfter = ref<Date>(),
  updatedBefore = ref<Date>(),
  updatedFilter = ref<"" | ResourceUpdatedFilter>(""),
}: Partial<Except<ResourceListFilters, "types">> = {}) => {
  const { $trpc } = useNuxtApp();
  const counts = ref<ResourceTypeCount[]>([]);
  const isLoading = ref(false);
  const error = ref("");
  let callId = 0;
  const refresh = async () => {
    const id = ++callId;
    // Shared with the list so a card's count is the number the list shows once the card sets its type
    const filterInput = getResourceFilterInput({
      searchQuery: searchQuery.value,
      status: status.value,
      types: [],
      updatedAfter: updatedAfter.value,
      updatedBefore: updatedBefore.value,
      updatedFilter: updatedFilter.value,
    });
    isLoading.value = true;
    error.value = "";
    await getResultAsync(() => $trpc.resource.countsByType.query(filterInput)).match(
      (newCounts) => {
        if (id === callId) counts.value = newCounts;
      },
      (readError) => {
        if (id === callId) error.value = readError.message;
      },
    );
    if (id === callId) isLoading.value = false;
  };
  return { counts, error, isLoading, refresh };
};
