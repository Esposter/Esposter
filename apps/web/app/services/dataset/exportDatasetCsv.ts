import type { ResourceInResource } from "@esposter/db-schema";

import { MimeType } from "#shared/models/file/MimeType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { createDatasetCsv } from "@/services/dataset/createDatasetCsv";
import { DatasetProviderTypeResourceTypeMap } from "@/services/dataset/DatasetProviderTypeResourceTypeMap";
import { getDatasetErrorMessage } from "@/services/dataset/getDatasetErrorMessage";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { downloadFile, getResultAsync, noop } from "@esposter/shared";

// The data a dataset-serving resource shows, as one CSV of the same read a Dashboard binding takes. A capped read
// Says so in an alert, since a file of the first rows would otherwise pass for the whole dataset
export const exportDatasetCsv = async (resource: ResourceInResource) => {
  const type = DatasetProviderTypeResourceTypeMap[resource.type];
  if (!type) return;

  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  await getResultAsync(async () => {
    const dataset = await $trpc.dataset.readDataset.query({ id: resource.id, type });
    const truncation = getDatasetTruncation(dataset);
    if (truncation) createAlert(getDatasetTruncationText(truncation), "warning");
    downloadFile(`${resource.name}.csv`, createDatasetCsv(dataset), MimeType.Csv);
  }).match(noop, (error) => {
    createErrorAlert(error, getDatasetErrorMessage(error));
  });
};
