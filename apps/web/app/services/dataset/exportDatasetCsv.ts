import type { ResourceInResource } from "@esposter/db-schema";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { downloadFile } from "@/services/app/downloadFile";
import { createDatasetCsv } from "@/services/dataset/createDatasetCsv";
import { DatasetProviderTypeResourceTypeMap } from "@/services/dataset/DatasetProviderTypeResourceTypeMap";
import { getDatasetErrorMessage } from "@/services/dataset/getDatasetErrorMessage";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop } from "@esposter/shared";

// The data a dataset-serving resource shows, as one CSV of the same read a Dashboard binding takes. A capped read
// says so in an alert, since a file of the first rows would otherwise pass for the whole dataset
export const exportDatasetCsv = async (resource: ResourceInResource) => {
  const type = DatasetProviderTypeResourceTypeMap[resource.type];
  if (!type) return;

  const { $trpc } = useNuxtApp();
  const { createAlert } = useAlertStore();
  await getResultAsync(async () => {
    const dataset = await $trpc.dataset.readDataset.query({ id: resource.id, type });
    const truncation = getDatasetTruncation(dataset);
    if (truncation) createAlert(getDatasetTruncationText(truncation), "warning");
    downloadFile(
      `${resource.name}.csv`,
      createDatasetCsv(dataset),
      DataSourceConfigurationMap[DataSourceType.Csv].mimeType,
    );
  }).match(noop, (error) => createErrorAlert(error, getDatasetErrorMessage(error)));
};
