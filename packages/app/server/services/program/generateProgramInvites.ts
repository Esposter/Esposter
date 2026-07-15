import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Clause, Resource } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { DatasetProviderMap } from "@@/server/services/dataset/DatasetProviderMap";
import { danglingProgramBindingError } from "@@/server/services/program/danglingProgramBindingError";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { createEntity, getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ProgramInviteEntity,
} from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Idempotent by the audience key value: re-running after the audience grows issues only the missing
// Tokens and never rotates an existing one, because a rotated token would dead-link an already-sent invite
export const generateProgramInvites = async (
  ctx: AuthedContext,
  programId: Resource["id"],
): Promise<ProgramInvite[]> => {
  const content = await readResourceContent(programResourceSchema, programId);
  if (!content?.audience || !content.keyColumn) throw danglingProgramBindingError();

  // A deleted audience makes its provider throw UNAUTHORIZED — surfaced as the program's own
  // Dangling-binding error rather than thrown through as if the owner had lost access to their program
  const audience = content.audience;
  const { columns, rows } = await getResultAsync(() => DatasetProviderMap[audience.type](ctx, audience)).match(
    (dataset) => dataset,
    () => {
      throw danglingProgramBindingError();
    },
  );
  if (!columns.some(({ name }) => name === content.keyColumn)) throw danglingProgramBindingError();

  const clauses: Clause<ProgramInviteEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: programId },
  ];
  const programInviteClient = await useTableClient(AzureTable.ProgramInvites);
  const existingInvites = await getTopNEntities(programInviteClient, AZURE_MAX_PAGE_SIZE, ProgramInviteEntity, {
    filter: serializeClauses(clauses),
  });
  const invitesByKeyValue = new Map<string, ProgramInvite>(
    existingInvites.map(({ keyValue, rowKey }) => [keyValue, { keyValue, token: rowKey }]),
  );
  // One token per distinct key value — the same recipient twice in the audience is one invite
  for (const row of rows) {
    const keyValue = row[content.keyColumn];
    if (typeof keyValue !== "string" || !keyValue || invitesByKeyValue.has(keyValue)) continue;

    // A UUID, never derived from the key — a derivable token would let anyone mint one from an email address
    const token = crypto.randomUUID();
    await createEntity(
      programInviteClient,
      new ProgramInviteEntity({ keyValue, partitionKey: programId, rowKey: token }),
    );
    invitesByKeyValue.set(keyValue, { keyValue, token });
  }
  return [...invitesByKeyValue.values()];
};
