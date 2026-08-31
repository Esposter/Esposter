import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";
import type { Except } from "type-fest";

import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";
// The summary cards read every filter except `types` — the cards are what sets it, so grouping by a type
// The user already narrowed to would only ever render the one card they are standing on
export const useReadResourceTypeCounts = (getFilters: () => Except<ResourceFilterValues, "types">) => {
  const { $trpc } = useNuxtApp();
  return useReadCounts("useReadResourceTypeCounts", () =>
    // Shared with the list so a card's count is the number the list shows once the card sets its type
    $trpc.resource.countsByType.query(getResourceFilterInput({ ...getFilters(), types: [] })),
  );
};
