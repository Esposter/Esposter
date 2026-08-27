import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { checkIsNotFound, getContainerClient, getContentBlobName } from "@esposter/db";
import { AzureContainer, relations, resources, ResourceType } from "@esposter/db-schema";
import { getResultAsync, streamToText } from "@esposter/shared";
import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// One-off, idempotent, safe to re-run: fills `resources.boundResourceId` for Programs whose content was written
// Before the column existed. Every save projects it from then on, so this only ever has the pre-migration
// Backlog to clear and converges to a no-op.
//
// `resolveIdentifiedToken` reads the blob for any Program still holding null, which is exactly what it did
// Before the column — so this script is an optimization, never a correctness prerequisite. Nothing breaks if it
// Is not run; those Programs simply keep paying the old cost until their owner saves them.
//
// Run with: pnpm backfill:bound-resource-id
const client = postgres(process.env.DATABASE_URL);
const db = drizzle({ client, relations });
const containerClient = await getContainerClient(
  process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING,
  AzureContainer.ResourceAssets,
);
const unprojectedPrograms = await db
  .select({ contentVersion: resources.contentVersion, id: resources.id })
  .from(resources)
  .where(and(eq(resources.type, ResourceType.Program), isNull(resources.boundResourceId)));
console.log(`${unprojectedPrograms.length} programs to inspect`);
let boundCount = 0;

for (const { contentVersion, id } of unprojectedPrograms) {
  // Sequential on purpose — this runs once, against every Program in the database, and a burst of parallel blob
  // Reads is the one thing a maintenance script should not do to a live storage account
  const content = await getResultAsync(async () => {
    const { readableStreamBody } = await containerClient.getBlobClient(getContentBlobName(id)).download();
    if (!readableStreamBody) return undefined;
    // Parsed the way `readContentBlob` parses it, so the script reads a binding exactly as the server wrote it.
    // Blanket date revival would be wrong here anyway: `keyColumn` names a column in the owner's own spreadsheet
    // eslint-disable-next-line no-restricted-syntax -- the content schema owns coercion, as in readContentBlob
    return programResourceSchema.parse(JSON.parse(await streamToText(readableStreamBody)));
  }).match(
    (parsedContent) => parsedContent,
    (error) => {
      // A Program created but never saved has no blob at all, which is not a failure — it is simply unbound.
      // Anything else is reported and skipped, so one unreadable blob cannot strand the rest of the backlog
      if (!checkIsNotFound(error)) console.error(`skipped ${id}:`, error);
      return undefined;
    },
  );
  if (!content?.surveyId) continue;

  // Compare-and-set against the version the blob was read under, not a bare id. The owner can save or unbind a
  // Program while this runs, and losing that race the naive way writes a binding read from a blob that no longer
  // Exists — which `resolveIdentifiedToken` then trusts, keeping tokens valid for a survey already unbound.
  // Still requiring null keeps it idempotent: a re-run never overwrites a projection some other writer has set
  const [updated] = await db
    .update(resources)
    .set({ boundResourceId: content.surveyId })
    .where(and(eq(resources.id, id), eq(resources.contentVersion, contentVersion), isNull(resources.boundResourceId)))
    .returning({ id: resources.id });
  if (updated) boundCount += 1;
  else console.log(`skipped ${id}: saved while the backfill was reading it, so its own save owns the binding`);
}

console.log(`${boundCount} bound, ${unprojectedPrograms.length - boundCount} left unbound`);
await client.end();
