import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

export const useDataset = (reference: MaybeRefOrGetter<DatasetReference | undefined>) => {
  const { $trpc } = useNuxtApp();
  const { executeQuery, isPending: isLoading } = useMutation();
  const dataset = ref<Dataset>();
  const error = ref<string>();
  // One instance shows one dataset, so a read for a previous reference is superseded by the latest one and
  // Can never overwrite it
  const key = Symbol("useDataset");
  const refresh = async () => {
    await executeQuery(
      () => {
        const referenceValue = toValue(reference);
        // Clearing the reference is itself the latest read, so an in-flight response for the old reference
        // Cannot land on an empty selection
        return referenceValue ? $trpc.dataset.readDataset.query(referenceValue) : Promise.resolve(undefined);
      },
      {
        key,
        onError: (newError) => {
          error.value = newError.message;
        },
        onSuccess: (newDataset) => {
          dataset.value = newDataset;
          error.value = undefined;
        },
      },
    );
  };
  watch(() => toValue(reference), refresh, { deep: true, immediate: true });
  return { dataset, error, isLoading, refresh };
};
