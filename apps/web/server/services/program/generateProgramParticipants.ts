import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { GeneratedProgramParticipants } from "#shared/models/resource/program/GeneratedProgramParticipants";
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
import { chunk, generateSecretToken, hashSecretToken } from "@esposter/shared";
import { v7 } from "uuid";

// Idempotent by the audience key value: re-running after the audience grows issues only the missing participants and
// never replaces an existing credential, because a replaced one would dead-link a link already sent out. The guarantee
// is the unique constraint on the program and the key, not this read-then-write
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
  // This read did not see, and the insert below still refuses to issue them a second credential
  const existingParticipants = await readProgramParticipantEntities(ctx.db, programId);
  const existingKeyValues = new Set(existingParticipants.map(({ keyValue }) => keyValue));
  // One credential per distinct key value — the same recipient twice in the audience is one participant
  const newKeyValues = new Set<string>();
  for (const row of rows) {
    const keyValue = row[keyColumn];
    if (typeof keyValue === "string" && keyValue && !existingKeyValues.has(keyValue)) newKeyValues.add(keyValue);
  }
  // Only the hash is stored. The credential leaves in this run's answer alone, and no later read can return it again
  const issuedParticipants = await Promise.all(
    [...newKeyValues].map(async (keyValue) => {
      const token = generateSecretToken();
      return { keyValue, token, tokenHash: await hashSecretToken(token) };
    }),
  );
  // The batches are independent, so they overlap. A participant another run claimed first conflicts and is left out of
  // this answer: that run issued its credential, and its owner was answered with it
  const insertedKeyValueSets = await Promise.all(
    chunk(issuedParticipants, PROGRAM_PARTICIPANT_BATCH_SIZE).map(async (batch) => {
      const insertedParticipants = await ctx.db
        .insert(programParticipantsInResource)
        .values(
          batch.map(({ keyValue, tokenHash }) => ({ keyValue, publicId: v7(), resourceId: programId, tokenHash })),
        )
        .onConflictDoNothing()
        .returning({ keyValue: programParticipantsInResource.keyValue });
      return insertedParticipants.map(({ keyValue }) => keyValue);
    }),
  );
  const insertedKeyValues = new Set(insertedKeyValueSets.flat());
  const audienceTruncation = getDatasetTruncation(audienceDataset);
  return {
    ...(audienceTruncation && { audienceTruncation }),
    participants: issuedParticipants
      .filter(({ keyValue }) => insertedKeyValues.has(keyValue))
      .map(({ keyValue, token }) => ({ keyValue, token })),
  };
};
