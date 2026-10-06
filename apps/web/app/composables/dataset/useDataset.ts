import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { DATASET_SOURCE_NOT_FOUND_MESSAGE } from "@/services/dataset/constants";
import { TRPCClientError } from "@trpc/client";

export const useDataset = (reference: MaybeRefOrGetter<DatasetReference | undefined>) => {
  const { $trpc } = useNuxtApp();
  const { executeQuery, isPending } = useMutation();
  const dataset = ref<Dataset>();
  const error = ref("");
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
        // A missing source is the one failure the owner fixes in place, so it says how rather than echoing the id
        onError: (newError) => {
          error.value =
            newError instanceof TRPCClientError && newError.data?.code === "NOT_FOUND"
              ? DATASET_SOURCE_NOT_FOUND_MESSAGE
              : newError.message;
        },
        onSuccess: (newDataset) => {
          dataset.value = newDataset;
          error.value = "";
        },
      },
    );
  };
  watchDeep(() => toValue(reference), refresh, { immediate: true });
  return { dataset, error, isPending, refresh };
};
