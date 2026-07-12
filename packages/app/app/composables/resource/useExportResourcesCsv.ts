import type { Resource } from "@esposter/db-schema";

import { MimeType } from "#shared/models/file/MimeType";
import { MAX_CSV_EXPORT_ROWS } from "@/services/resource/constants";
import { getResourcesCsv } from "@/services/resource/list/getResourcesCsv";
import { useNotificationStore } from "@/store/notification";
import { MAX_READ_LIMIT } from "@esposter/shared";

const CSV_ACCEPT = ".csv";

export const useExportResourcesCsv = () => {
  const notificationStore = useNotificationStore();
  const { createNotification } = notificationStore;
  const exportFile = useExportFile();
  const exportResourcesCsv = async (resourceItems: Resource[]) => {
    const isExported = await exportFile(
      (mimeType) => Promise.resolve(new Blob([getResourcesCsv(resourceItems)], { type: mimeType })),
      "resources",
      MimeType.Csv,
      CSV_ACCEPT,
    );
    if (isExported)
      createNotification({ severity: "success", title: `Exported ${resourceItems.length} resources to CSV` });
    return isExported;
  };
  // Re-queries the current filter in page-sized chunks up to the export cap — never one query
  // With the full count as its limit, so export cost stays bounded
  const exportAllResourcesCsv = async (
    readResourcesPage: (input: { limit: number; offset: number }) => Promise<{ hasMore: boolean; items: Resource[] }>,
  ) => {
    const allResources: Resource[] = [];
    let offset = 0;
    let isTruncated = false;
    while (true) {
      const { hasMore, items } = await readResourcesPage({ limit: MAX_READ_LIMIT, offset });
      allResources.push(...items);
      if (!hasMore) break;
      else if (allResources.length >= MAX_CSV_EXPORT_ROWS) {
        isTruncated = true;
        break;
      }

      offset += MAX_READ_LIMIT;
    }
    const isExported = await exportResourcesCsv(allResources.slice(0, MAX_CSV_EXPORT_ROWS));
    if (isExported && isTruncated)
      createNotification({
        severity: "warning",
        title: `Export truncated to the first ${MAX_CSV_EXPORT_ROWS} resources`,
      });
  };
  return { exportAllResourcesCsv, exportResourcesCsv };
};
