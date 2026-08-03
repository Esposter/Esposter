import type { ResourceTypeCount } from "#shared/models/resource/ResourceTypeCount";
import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";
import type { Except } from "type-fest";

import { getResourceFilterInput } from "@/services/resource/list/getResourceFilterInput";
// The summary cards read every filter except `types` — the cards are what sets it, so grouping by a type
// The user already narrowed to would only ever render the one card they are standing on
export const useReadResourceTypeCounts = (getFilters: () => Except<ResourceFilterValues, "types">) => {
  const { $trpc } = useNuxtApp();
  const { executeQuery, isPending: isLoading } = useMutation();
  const counts = ref<ResourceTypeCount[]>([]);
  const error = ref("");
  // The cards are one target, so a slower earlier count can never overwrite the one the latest filter asked for
  const key = Symbol("useReadResourceTypeCounts");
  const refresh = async () => {
    error.value = "";
    await executeQuery(
      () =>
        // Shared with the list so a card's count is the number the list shows once the card sets its type
        $trpc.resource.countsByType.query(getResourceFilterInput({ ...getFilters(), types: [] })),
      {
        key,
        onError: (readError) => {
          error.value = readError.message;
        },
        onSuccess: (newCounts) => {
          counts.value = newCounts;
        },
      },
    );
  };
  return { counts, error, isLoading, refresh };
};
