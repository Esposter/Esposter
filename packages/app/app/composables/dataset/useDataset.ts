import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { getResultAsync, withFinalizerAsync } from "@esposter/shared";

export const useDataset = (reference: MaybeRefOrGetter<DatasetReference | undefined>) => {
  const { $trpc } = useNuxtApp();
  const dataset = ref<Dataset>();
  const error = ref<string>();
  const isLoading = ref(false);
  const refresh = async () => {
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
            dataset.value = newDataset;
            error.value = undefined;
          },
          (newError) => {
            error.value = newError.message;
          },
        ),
      () => {
        isLoading.value = false;
      },
    );
  };
  watch(() => toValue(reference), refresh, { deep: true, immediate: true });
  return { dataset, error, isLoading, refresh };
};
