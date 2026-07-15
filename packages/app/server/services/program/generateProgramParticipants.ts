import type { ProgramParticipant } from "#shared/models/resource/program/ProgramParticipant";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Clause, Resource } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { DatasetProviderMap } from "@@/server/services/dataset/DatasetProviderMap";
import { danglingProgramBindingError } from "@@/server/services/program/danglingProgramBindingError";
import { getProgramParticipantId } from "@@/server/services/program/getProgramParticipantId";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { RestError } from "@azure/data-tables";
import { createEntity, getEntity, getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ProgramParticipantEntity,
} from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Idempotent by the audience key value: re-running after the audience grows issues only the missing
// Tokens and never rotates an existing one, because a rotated token would dead-link a link already sent out.
// The guarantee is the storage key, not this read-then-write — see ProgramParticipantEntity
export const generateProgramParticipants = async (
  ctx: AuthedContext,
  programId: Resource["id"],
): Promise<ProgramParticipant[]> => {
  const content = await readResourceContent(programResourceSchema, programId);
  if (!content?.audience || !content.keyColumn) throw danglingProgramBindingError();

  // A deleted audience makes its provider throw UNAUTHORIZED — surfaced as the program's own
  // Dangling-binding error rather than thrown through as if the owner had lost access to their program.
  // Every other failure is a real fault and propagates, so a transient storage or parse error is never
  // Mistaken for a permanently broken binding
  const audience = content.audience;
  const { columns, rows } = await getResultAsync(() => DatasetProviderMap[audience.type](ctx, audience)).match(
    (dataset) => dataset,
    (error) => {
      if (error instanceof TRPCError && error.code === "UNAUTHORIZED") throw danglingProgramBindingError();
      throw error;
    },
  );
  if (!columns.some(({ name }) => name === content.keyColumn)) throw danglingProgramBindingError();

  const clauses: Clause<ProgramParticipantEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: programId },
  ];
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  // The capped page is a warm cache, never the source of truth — a participant past the cap is simply one
  // This read did not see, and the insert below still refuses to issue them a second token
  const existingParticipants = await getTopNEntities(
    programParticipantClient,
    AZURE_MAX_PAGE_SIZE,
    ProgramParticipantEntity,
    { filter: serializeClauses(clauses) },
  );
  const participantsByKeyValue = new Map<string, ProgramParticipant>(
    existingParticipants.map(({ keyValue, token }) => [keyValue, { keyValue, token }]),
  );
  // One token per distinct key value — the same recipient twice in the audience is one participant
  for (const row of rows) {
    const keyValue = row[content.keyColumn];
    if (typeof keyValue !== "string" || !keyValue || participantsByKeyValue.has(keyValue)) continue;

    const rowKey = getProgramParticipantId(keyValue);
    const token = crypto.randomUUID();
    const isCreated = await getResultAsync(() =>
      createEntity(
        programParticipantClient,
        new ProgramParticipantEntity({
          keyValue,
          partitionKey: programId,
          publicId: crypto.randomUUID(),
          rowKey,
          token,
        }),
      ),
    ).match(
      () => true,
      (error) => {
        if (error instanceof RestError && error.statusCode === 409) return false;
        throw error;
      },
    );
    if (isCreated) {
      participantsByKeyValue.set(keyValue, { keyValue, token });
      continue;
    }

    // Someone else got there first, so their token is the one that may already be sitting in an inbox —
    // This run adopts it and drops the token it just minted, which was never stored and never sent
    const existingParticipant = await getEntity(programParticipantClient, ProgramParticipantEntity, programId, rowKey);
    if (existingParticipant) participantsByKeyValue.set(keyValue, { keyValue, token: existingParticipant.token });
  }
  return [...participantsByKeyValue.values()];
};
