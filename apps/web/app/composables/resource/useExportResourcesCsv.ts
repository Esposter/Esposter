import type { Page, ResourceInResource } from "@esposter/db-schema";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { MAX_CSV_EXPORT_ROWS } from "@/services/resource/constants";
import { getResourcesCsv } from "@/services/resource/list/getResourcesCsv";
import { readAllResourcePages } from "@/services/resource/readAllResourcePages";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { useNotificationStore } from "@/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const useExportResourcesCsv = () => {
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification, createWarningNotification } = notificationStore;
  const exportFile = useExportFile();
  const exportResourcesCsv = async (resources: ResourceInResource[]) => {
    const isExported = await exportFile(
      (mimeType) => Promise.resolve(new Blob([getResourcesCsv(resources)], { type: mimeType })),
      "resources",
      DataSourceConfigurationMap[DataSourceType.Csv].mimeType,
      DataSourceConfigurationMap[DataSourceType.Csv].accept,
    );
    if (isExported)
      createNotification({
        severity: NotificationSeverity.Success,
        title: `Exported ${resources.length} resources to CSV`,
      });
    return isExported;
  };
  // Re-queries the current filter in page-sized chunks up to the export cap, so export cost stays bounded
  const exportAllResourcesCsv = async (readResourcesPage: (cursor: string) => Promise<Page<ResourceInResource>>) => {
    // Fire-and-forget from the toolbar, so a page query rejection is captured here instead of surfacing unhandled
    await getResultAsync(async () => {
      // One row past the cap tells a full export from a truncated one
      const allResources = await readAllResourcePages(readResourcesPage, MAX_CSV_EXPORT_ROWS + 1);
      const isExported = await exportResourcesCsv(allResources.slice(0, MAX_CSV_EXPORT_ROWS));
      if (isExported && allResources.length > MAX_CSV_EXPORT_ROWS)
        createWarningNotification(`Export truncated to the first ${MAX_CSV_EXPORT_ROWS} resources`);
    }).match(noop, createErrorNotification);
  };
  return { exportAllResourcesCsv, exportResourcesCsv };
};
