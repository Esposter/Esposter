import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";
import type { Except } from "type-fest";

import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";

// The summary cards read every filter except `types` — the cards are what sets it, so grouping by a type
// The user already narrowed to would only ever render the one card they are standing on. Lazy, because the
// Cards are only mounted in summary mode and the read follows the mode rather than setup; a failure surfaces
// Where the cards render rather than as a toast
export const useReadResourceTypeCounts = (getFilters: () => Except<ResourceFilterValues, "types">) => {
  const { $trpc } = useNuxtApp();
  const { data, error, isPending, refresh } = useQuery(
    // Shared with the list so a card's count is the number the list shows once the card sets its type
    () => $trpc.resource.readResourceTypeCounts.query(getResourceFilterInput({ ...getFilters(), types: [] })),
    { isInlineError: true, isLazy: true },
  );
  const counts = computed(() => data.value ?? []);
  return { counts, error, isPending, refresh };
};
