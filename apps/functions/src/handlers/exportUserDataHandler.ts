import type { InvocationContext } from "@azure/functions";
import type { ExportUserDataEventGridData } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
import { buildUserDataArchive } from "#src/services/user/buildUserDataArchive";
import { DATA_EXPORT_RETENTION } from "#src/services/user/constants";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { AzureFunction, dataExportsInUser, DataExportStatus } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { eq } from "drizzle-orm";

// Builds one export's archive into the blob named for its row. The row is marked building with the blob's name, and
// Ready only after the upload commits, so a link is never offered for an archive still being written. A build that fails
// Is recorded on the row with its reason, and the event is not rethrown, since the person sees that reason on their
// Settings page. A replayed event rebuilds the same blob
export const exportUserDataHandler = async (
  context: InvocationContext,
  { dataExportId }: ExportUserDataEventGridData,
): Promise<void> => {
  const blobName = getDataExportBlobName(dataExportId);
  // The row names the person whose stores the archive reads, so the event carries only the row
  const [buildingRow] = await db
    .update(dataExportsInUser)
    .set({ blobName, status: DataExportStatus.Building })
    .where(eq(dataExportsInUser.id, dataExportId))
    .returning({ userId: dataExportsInUser.userId });
  // A row its account's deletion removed has no one left to build for
  if (!buildingRow) return;

  await getResultAsync(() => buildUserDataArchive(buildingRow.userId, blobName)).match(
    async () => {
      const readyAt = Temporal.Now.instant();
      await db
        .update(dataExportsInUser)
        .set({
          expiresAt: new Date(readyAt.add(DATA_EXPORT_RETENTION).epochMilliseconds),
          readyAt: new Date(readyAt.epochMilliseconds),
          status: DataExportStatus.Ready,
        })
        .where(eq(dataExportsInUser.id, dataExportId));
    },
    async (error) => {
      context.error(`${AzureFunction.ExportUserData} failed for ${dataExportId}`, error);
      await db
        .update(dataExportsInUser)
        .set({ failureReason: error.message, status: DataExportStatus.Failed })
        .where(eq(dataExportsInUser.id, dataExportId));
    },
  );
};
