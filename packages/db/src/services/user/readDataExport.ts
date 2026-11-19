import type { Database, DataExportInUser } from "@esposter/db-schema";

import { readActiveDataExport } from "#src/services/user/readActiveDataExport";

// The export the settings page shows: the one being built, else the latest export of any status, so a failed build is shown
// Rather than hidden behind an older ready one
export const readDataExport = async (db: Database, userId: string): Promise<DataExportInUser | undefined> => {
  const activeDataExport = await readActiveDataExport(db, userId);
  if (activeDataExport) return activeDataExport;
  return db.query.dataExportsInUser.findFirst({ orderBy: { requestedAt: "desc" }, where: { userId: { eq: userId } } });
};
