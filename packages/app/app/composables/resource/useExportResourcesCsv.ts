import type { Resource } from "@esposter/db-schema";

import { MimeType } from "#shared/models/file/MimeType";
import { MAX_CSV_EXPORT_ROWS } from "@/services/resource/constants";
import { getResourcesCsv } from "@/services/resource/list/getResourcesCsv";
import { useNotificationStore } from "@/store/notification";
import { NotificationSeverity } from "@esposter/db-schema";
import { getResultAsync, MAX_READ_LIMIT, noop } from "@esposter/shared";

const CSV_ACCEPT = ".csv";

export const useExportResourcesCsv = () => {
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const exportFile = useExportFile();
  const exportResourcesCsv = async (resourceItems: Resource[]) => {
    const isExported = await exportFile(
      (mimeType) => Promise.resolve(new Blob([getResourcesCsv(resourceItems)], { type: mimeType })),
      "resources",
      MimeType.Csv,
      CSV_ACCEPT,
    );
    if (isExported)
      createNotification({
        severity: NotificationSeverity.Success,
        title: `Exported ${resourceItems.length} resources to CSV`,
      });
    return isExported;
  };
  // Re-queries the current filter in page-sized chunks up to the export cap, so export cost stays bounded
  const exportAllResourcesCsv = async (
    readResourcesPage: (input: { limit: number; offset: number }) => Promise<{ hasMore: boolean; items: Resource[] }>,
  ) => {
    // Fire-and-forget from the toolbar, so a page query rejection is captured here instead of surfacing unhandled
    await getResultAsync(async () => {
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
          severity: NotificationSeverity.Warning,
          title: `Export truncated to the first ${MAX_CSV_EXPORT_ROWS} resources`,
        });
    }).match(noop, createErrorNotification);
  };
  return { exportAllResourcesCsv, exportResourcesCsv };
};
