import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { DatasetProviderMap } from "@@/server/services/dataset/DatasetProviderMap";
import { getDanglingProgramBindingError } from "@@/server/services/program/getDanglingProgramBindingError";
import { getProgramParticipantId } from "@@/server/services/program/getProgramParticipantId";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { AZURE_MAX_BATCH_SIZE, AZURE_MAX_PAGE_SIZE, getPartitionKeyFilter } from "@esposter/azure";
import { checkIsConflict, createEntity, getEntity, getTopNEntities, serializeEntity } from "@esposter/db";
import { AzureTable, ProgramParticipantEntity } from "@esposter/db-schema";
import { chunk, getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// A create whose row already exists is the one rejection this path expects — it means a concurrent run
// Claimed the recipient first. Every other failure is a real fault and propagates, so a transient storage
// Error is never mistaken for a collision and degraded into a per-row storm that fails anyway
const checkIsCreated = (create: () => Promise<unknown>): Promise<boolean> =>
  getResultAsync(create).match(
    () => true,
    (error) => {
      if (checkIsConflict(error)) return false;
      throw error;
    },
  );

// Idempotent by the audience key value: re-running after the audience grows issues only the missing
// Tokens and never rotates an existing one, because a rotated token would dead-link a link already sent out.
// The guarantee is the storage key, not this read-then-write — see ProgramParticipantEntity
export const generateProgramParticipants = async (
  ctx: AuthedContext,
  programId: Resource["id"],
): Promise<ProgramParticipant[]> => {
  const content = await readResourceContent(programResourceSchema, programId);
  if (!content?.audience || !content.keyColumn) throw getDanglingProgramBindingError();
  // A deleted audience makes its provider throw UNAUTHORIZED — surfaced as the program's own
  // Dangling-binding error rather than thrown through as if the owner had lost access to their program.
  // Every other failure is a real fault and propagates, so a transient storage or parse error is never
  // Mistaken for a permanently broken binding
  const audience = content.audience;
  const { columns, rows } = await getResultAsync(() => DatasetProviderMap[audience.type](ctx, audience)).match(
    (dataset) => dataset,
    (error) => {
      if (error instanceof TRPCError && error.code === "UNAUTHORIZED") throw getDanglingProgramBindingError();
      throw error;
    },
  );
  if (!columns.some(({ name }) => name === content.keyColumn)) throw getDanglingProgramBindingError();

  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  // The capped page is a warm cache, never the source of truth — a participant past the cap is simply one
  // This read did not see, and the insert below still refuses to issue them a second token
  const existingParticipants = await getTopNEntities(
    programParticipantClient,
    AZURE_MAX_PAGE_SIZE,
    ProgramParticipantEntity,
    { filter: getPartitionKeyFilter(programId) },
  );
  const keyValueParticipantMap = new Map<string, ProgramParticipant>(
    existingParticipants.map(({ keyValue, token }) => [keyValue, { keyValue, token }]),
  );
  // One token per distinct key value — the same recipient twice in the audience is one participant
  const newParticipants: ProgramParticipantEntity[] = [];
  const newKeyValues = new Set<string>();
  for (const row of rows) {
    const keyValue = row[content.keyColumn];
    if (typeof keyValue !== "string" || !keyValue || keyValueParticipantMap.has(keyValue) || newKeyValues.has(keyValue))
      continue;

    newKeyValues.add(keyValue);
    newParticipants.push(
      new ProgramParticipantEntity({
        keyValue,
        partitionKey: programId,
        publicId: crypto.randomUUID(),
        rowKey: getProgramParticipantId(keyValue),
        token: crypto.randomUUID(),
      }),
    );
  }
  // Every participant of a program shares its partition, so the inserts ride one transaction per batch
  // Instead of a round trip each — an audience at the read cap costs ten calls rather than a thousand,
  // And this is a single mutation request the owner waits on
  for (const batch of chunk(newParticipants, AZURE_MAX_BATCH_SIZE)) {
    const isBatchCreated = await checkIsCreated(() =>
      programParticipantClient.submitTransaction(batch.map((participant) => ["create", serializeEntity(participant)])),
    );
    if (isBatchCreated) {
      for (const { keyValue, token } of batch) keyValueParticipantMap.set(keyValue, { keyValue, token });
      continue;
    }
    // A transaction is all-or-nothing, so one recipient a concurrent run already claimed rolls back the
    // Whole batch — replay it insert by insert, which lands everyone this run is still the first to reach
    for (const participant of batch) {
      const { keyValue, rowKey, token } = participant;
      const isCreated = await checkIsCreated(() => createEntity(programParticipantClient, participant));
      if (isCreated) {
        keyValueParticipantMap.set(keyValue, { keyValue, token });
        continue;
      }
      // Someone else got there first, so their token is the one that may already be sitting in an inbox —
      // This run adopts it and drops the token it just minted, which was never stored and never sent
      const existingParticipant = await getEntity(
        programParticipantClient,
        ProgramParticipantEntity,
        programId,
        rowKey,
      );
      if (existingParticipant) keyValueParticipantMap.set(keyValue, { keyValue, token: existingParticipant.token });
    }
  }
  return [...keyValueParticipantMap.values()];
};
