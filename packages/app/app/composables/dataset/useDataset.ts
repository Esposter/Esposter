import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { getConcurrentFunction } from "#shared/util/function/getConcurrentFunction";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";

export const useDataset = (reference: MaybeRefOrGetter<DatasetReference | undefined>) => {
  const { $trpc } = useNuxtApp();
  const dataset = ref<Dataset>();
  const error = ref<string>();
  const isLoading = ref(false);
  // Concurrent so a slow response for a previous reference cannot overwrite the latest one
  const refresh = getConcurrentFunction(async (checkIsStale) => {
    const referenceValue = toValue(reference);
    if (!referenceValue) {
      dataset.value = undefined;
      error.value = undefined;
      return;
    }

    isLoading.value = true;
    await withFinalizerAsync(
      () =>
        getResultAsync(() => $trpc.dataset.readDataset.query(referenceValue)).match(
          (newDataset) => {
            if (checkIsStale()) return;
            dataset.value = newDataset;
            error.value = undefined;
          },
          (newError) => {
            if (checkIsStale()) return;
            error.value = newError.message;
          },
        ),
      () => {
        if (!checkIsStale()) isLoading.value = false;
      },
    );
  });
  watch(() => toValue(reference), refresh, { deep: true, immediate: true });
  return { dataset, error, isLoading, refresh };
};
