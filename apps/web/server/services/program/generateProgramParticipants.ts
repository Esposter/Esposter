import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { GeneratedProgramParticipants } from "#shared/models/resource/program/GeneratedProgramParticipants";
import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";
import type { ResourceInResource } from "@esposter/db-schema";

import { getDanglingProgramBindingError } from "#server/services/program/getDanglingProgramBindingError";
import { PROGRAM_PARTICIPANT_BATCH_SIZE } from "#server/services/program/constants";
import { readProgramAudienceDataset } from "#server/services/program/readProgramAudienceDataset";
import { readProgramParticipantEntities } from "#server/services/program/readProgramParticipantEntities";
import { readOwnedResource } from "#server/services/resource/readOwnedResource";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { programParticipantsInResource, ResourceType } from "@esposter/db-schema";
import { chunk } from "@esposter/shared";
import { and, eq, inArray } from "drizzle-orm";

// Idempotent by the audience key value: re-running after the audience grows issues only the missing
// Tokens and never rotates an existing one, because a rotated token would dead-link a link already sent out.
// The guarantee is the unique constraint on the program and the key, not this read-then-write
export const generateProgramParticipants = async (
  ctx: AuthedContext,
  programId: ResourceInResource["id"],
): Promise<GeneratedProgramParticipants> => {
  const content = await readResourceContent(programResourceSchema, programId);
  if (!content?.audience || !content.keyColumn || !content.surveyId) throw getDanglingProgramBindingError();
  // An audience whose source is gone reads as NOT_FOUND — surfaced as the program's own dangling-binding error,
  // Whose fix is the same rebind. Every other failure is a real fault and propagates, so a transient storage or
  // Parse error is never mistaken for a permanently broken binding. Every link issued opens the survey, so one
  // That is gone would hand the owner links to nowhere; the two reads are independent, so they overlap
  const { audience, keyColumn, surveyId } = content;
  const [audienceDataset, survey] = await Promise.all([
    readProgramAudienceDataset(ctx, audience),
    readOwnedResource(ctx, surveyId, ResourceType.Survey),
  ]);
  const { columns, rows } = audienceDataset;
  if (!survey || !columns.some(({ name }) => name === keyColumn)) throw getDanglingProgramBindingError();
  // The capped page is a warm cache, never the source of truth — a participant past the cap is simply one
  // This read did not see, and the insert below still refuses to issue them a second token
  const existingParticipants = await readProgramParticipantEntities(ctx.db, programId);
  const keyValueParticipantMap = new Map<string, ProgramParticipant>(
    existingParticipants.map(({ keyValue, token }) => [keyValue, { keyValue, token }]),
  );
  // One token per distinct key value — the same recipient twice in the audience is one participant
  const newParticipants: (typeof programParticipantsInResource.$inferInsert)[] = [];
  const newKeyValues = new Set<string>();
  for (const row of rows) {
    const keyValue = row[keyColumn];
    if (typeof keyValue !== "string" || !keyValue || keyValueParticipantMap.has(keyValue) || newKeyValues.has(keyValue))
      continue;

    newKeyValues.add(keyValue);
    newParticipants.push({
      keyValue,
      publicId: crypto.randomUUID(),
      resourceId: programId,
      token: crypto.randomUUID(),
    });
  }
  // The batches are independent, so they overlap. A participant another run claimed first conflicts and comes back
  // unreturned, and its token is the one a link may already carry, so this run adopts it and drops the token it minted
  const batchParticipants = await Promise.all(
    chunk(newParticipants, PROGRAM_PARTICIPANT_BATCH_SIZE).map(async (batch): Promise<ProgramParticipant[]> => {
      const insertedParticipants = await ctx.db
        .insert(programParticipantsInResource)
        .values(batch)
        .onConflictDoNothing()
        .returning({ keyValue: programParticipantsInResource.keyValue, token: programParticipantsInResource.token });
      const insertedKeyValues = new Set(insertedParticipants.map(({ keyValue }) => keyValue));
      const claimedKeyValues = batch
        .map(({ keyValue }) => keyValue)
        .filter((keyValue) => !insertedKeyValues.has(keyValue));
      const claimedParticipants =
        claimedKeyValues.length === 0
          ? []
          : await ctx.db
              .select({ keyValue: programParticipantsInResource.keyValue, token: programParticipantsInResource.token })
              .from(programParticipantsInResource)
              .where(
                and(
                  eq(programParticipantsInResource.resourceId, programId),
                  inArray(programParticipantsInResource.keyValue, claimedKeyValues),
                ),
              );
      return [...insertedParticipants, ...claimedParticipants];
    }),
  );
  for (const participant of batchParticipants.flat()) keyValueParticipantMap.set(participant.keyValue, participant);
  const audienceTruncation = getDatasetTruncation(audienceDataset);
  return { ...(audienceTruncation && { audienceTruncation }), participants: [...keyValueParticipantMap.values()] };
};
