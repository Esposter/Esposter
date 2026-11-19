import type { Database } from "@esposter/db-schema";

import { DataExportStatus } from "@esposter/db-schema";

// The export a person is building or has queued, if one is still in flight
export const readActiveDataExport = (db: Database, userId: string) =>
  db.query.dataExportsInUser.findFirst({
    where: { status: { in: [DataExportStatus.Building, DataExportStatus.Queued] }, userId: { eq: userId } },
  });
