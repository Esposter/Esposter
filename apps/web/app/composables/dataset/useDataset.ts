import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { useRunScope } from "#src/composables/shared/useRunScope";
import { getDatasetErrorMessage } from "#src/services/dataset/getDatasetErrorMessage";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";

// The outcome of one read: the dataset it found, or the error it failed with
type DatasetRead = { dataset: Dataset | undefined } | { error: Error };

// A read of a reference is local work with no version, so it runs in a run scope. A reference read after it aborts the
// Read in flight, and only the newest read's answer is shown, so one instance shows one dataset
export const useDataset = (reference: MaybeRefOrGetter<DatasetReference | undefined>) => {
  const { $trpc } = useNuxtApp();
  const { run } = useRunScope();
  const dataset = ref<Dataset>();
  const error = ref("");
  const pendingReads = ref(0);
  const isPending = computed(() => pendingReads.value > 0);
  const refresh = () =>
    run(
      (signal) => {
        pendingReads.value++;
        return withFinalizerAsync(
          () =>
            // Clearing the reference is itself the latest read, so an in-flight response for the old reference
            // Cannot land on an empty selection
            getResultAsync(async (): Promise<DatasetRead> => {
              const referenceValue = toValue(reference);
              return {
                dataset: referenceValue ? await $trpc.dataset.readDataset.query(referenceValue, { signal }) : undefined,
              };
            }).match<DatasetRead>(
              (read) => read,
              (readError) => ({ error: readError }),
            ),
          () => {
            pendingReads.value--;
          },
        );
      },
      (read) => {
        // The dataset is the reference's, so a read that failed for it leaves none: the one before would offer the
        // Previous source's columns under a message saying this one cannot be read
        if ("error" in read) {
          dataset.value = undefined;
          error.value = getDatasetErrorMessage(read.error);
          return;
        }

        dataset.value = read.dataset;
        error.value = "";
      },
    );
  // A reference is read when its identity changes, so one emitted again unchanged is not read a second time
  watchImmediate([() => toValue(reference)?.type, () => toValue(reference)?.id], refresh);
  return { dataset, error, isPending, refresh };
};
