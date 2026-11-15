import type { ExportUserDataQueueMessage } from "@esposter/db-schema";

import { DATA_EXPORT_BLOB_PREFIX } from "@esposter/db-schema";

// The one archive a request writes, named by its row's id under the export prefix.
// So a replayed build overwrites the archive it wrote before
export const getDataExportBlobName = (dataExportId: ExportUserDataQueueMessage["dataExportId"]) =>
  `${DATA_EXPORT_BLOB_PREFIX}${dataExportId}.zip`;
