import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { getDatasetErrorMessage } from "#src/services/dataset/getDatasetErrorMessage";

// A read of a reference goes through executeQuery, so the topics its answer names are watched and a publish reads it
// Again. A reference read after one aborts the read in flight on the run scope, and only the newest read's answer is
// Shown, so one Instance shows one dataset
export const useDataset = (reference: MaybeRefOrGetter<DatasetReference | undefined>) => {
  const { $trpc } = useNuxtApp();
  const { executeQuery, isPending } = useMutation();
  const runScope = useRunScope();
  const dataset = ref<Dataset>();
  const error = ref("");
  const key = Symbol("useDataset");
  const refresh = () =>
    executeQuery(
      (signal) => {
        const referenceValue = toValue(reference);
        // Clearing the reference is itself the latest read, so an in-flight response for the old reference
        // Cannot land on an empty selection
        return referenceValue
          ? $trpc.dataset.readDataset.query(referenceValue, { signal })
          : Promise.resolve(undefined);
      },
      {
        key,
        // The dataset is the reference's, so a read that failed for it leaves none: the one before would offer the
        // Previous source's columns under a message saying this one cannot be read
        onError: (newError) => {
          dataset.value = undefined;
          error.value = getDatasetErrorMessage(newError);
        },
        onSuccess: (newDataset) => {
          dataset.value = newDataset;
          error.value = "";
        },
        runScope,
      },
    );
  // A reference is read when its identity changes, so one emitted again unchanged is not read a second time
  watchImmediate([() => toValue(reference)?.type, () => toValue(reference)?.id], refresh);
  return { dataset, error, isPending, refresh };
};
