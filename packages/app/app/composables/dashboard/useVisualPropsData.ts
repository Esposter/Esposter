import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { computeDatasetVisualPropsData } from "@/services/dashboard/dataset/computeDatasetVisualPropsData";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";

export const useVisualPropsData = (visual: MaybeRefOrGetter<Visual>) => {
  // A published snapshot is baked into the binding, so only unsnapshotted bindings resolve their reference
  const { dataset, error, isLoading, refresh } = useDataset(() => {
    const binding = toValue(visual).dataset;
    return binding && !binding.snapshot ? binding.reference : undefined;
  });
  const resolvedDataset = computed(() => {
    const binding = toValue(visual).dataset;
    return binding ? (binding.snapshot ?? dataset.value) : undefined;
  });
  const visualPropsData = computed<undefined | VisualPropsData>(() => {
    const { dataset: binding, type } = toValue(visual);
    if (!binding) return undefined;

    const resolvedDatasetValue = resolvedDataset.value;
    return resolvedDatasetValue ? computeDatasetVisualPropsData(type, resolvedDatasetValue, binding.query) : undefined;
  });
  // A snapshot froze whatever the read gave it, so a published visual reports the same truncation as a live one
  const truncation = computed(() => (resolvedDataset.value ? getDatasetTruncation(resolvedDataset.value) : undefined));
  return { error, isLoading, refresh, truncation, visualPropsData };
};
