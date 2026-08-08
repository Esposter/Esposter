import { useReadCounts } from "@/composables/resource/list/useReadCounts";

// The Tags entry's own read — the one thing the menu adds that the list surface could not already answer,
// Since a grouped count over tag names is not a filter of the resource list
export const useReadResourceTagCounts = () => {
  const { $trpc } = useNuxtApp();
  return useReadCounts("useReadResourceTagCounts", () => $trpc.resource.countsByTag.query());
};
