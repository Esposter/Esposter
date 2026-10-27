import type { ExportUserDataEventGridData } from "@esposter/db-schema";

// The one archive a request writes, named by its row's id so a replayed build overwrites the archive it wrote before
export const getDataExportBlobName = (dataExportId: ExportUserDataEventGridData["dataExportId"]) =>
  `${dataExportId}.zip`;
