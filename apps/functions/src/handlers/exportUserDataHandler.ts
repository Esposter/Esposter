import { db } from "#src/services/shared/db";
import { buildUserDataArchive } from "#src/services/user/buildUserDataArchive";
import { DATA_EXPORT_RETENTION } from "#src/services/user/constants";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { dataExportsInUser, DataExportStatus, exportUserDataQueueMessageSchema, QueueJob } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { eq } from "drizzle-orm";

// Builds one export's archive into the blob named for its row. The row is marked building with the blob's name.
// It is marked ready only after the upload commits, so a link is never offered for an archive still being written.
// A build that fails is recorded on the row with its reason, which the owner's read returns.
// The message is not rethrown, since the failure is already on the row. A retried message rebuilds the same blob
export const exportUserDataHandler = async (body: unknown): Promise<void> => {
  const { dataExportId } = exportUserDataQueueMessageSchema.parse(body);
  const blobName = getDataExportBlobName(dataExportId);
  // The row names the person whose stores the archive reads, so the message carries only the row
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
      console.error(`${QueueJob.ExportUserData} failed for ${dataExportId}`, error);
      await db
        .update(dataExportsInUser)
        .set({ failureReason: error.message, status: DataExportStatus.Failed })
        .where(eq(dataExportsInUser.id, dataExportId));
    },
  );
};
