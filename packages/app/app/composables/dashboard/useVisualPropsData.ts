import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { VisualPropsData } from "@/models/dashboard/VisualPropsData";

import { computeDatasetVisualPropsData } from "@/services/dashboard/dataset/computeDatasetVisualPropsData";

export const useVisualPropsData = (visual: MaybeRefOrGetter<Visual>) => {
  // A published snapshot is baked into the binding, so only unsnapshotted bindings resolve their reference
  const { dataset, error, isLoading, refresh } = useDataset(() => {
    const binding = toValue(visual).dataset;
    return binding && !binding.snapshot ? binding.reference : undefined;
  });
  const visualPropsData = computed<undefined | VisualPropsData>(() => {
    const { dataset: binding, type } = toValue(visual);
    if (!binding) return undefined;
    const resolvedDataset = binding.snapshot ?? dataset.value;
    return resolvedDataset ? computeDatasetVisualPropsData(type, resolvedDataset, binding.query) : undefined;
  });
  return { error, isLoading, refresh, visualPropsData };
};
