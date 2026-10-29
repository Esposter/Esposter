import type { ExportUserDataEventGridData } from "@esposter/db-schema";

// The one archive a request writes, named by its row's id under exports/.
// So a replayed build overwrites the archive it wrote before
export const getDataExportBlobName = (dataExportId: ExportUserDataEventGridData["dataExportId"]) =>
  `exports/${dataExportId}.zip`;
