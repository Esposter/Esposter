import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";
import type { Clause, Resource } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { readSurveyResponseEntities } from "@@/server/services/survey/readSurveyResponseEntities";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ProgramInviteEntity,
} from "@esposter/db-schema";

// The canonical invites × responses join, purpose-built rather than routed through a generic join engine.
// A response with no matching invite (an anonymous-era row) is simply not an invite, so it never appears here
export const readProgramStatusRows = async (programId: Resource["id"]): Promise<ProgramStatusRow[]> => {
  const inviteClauses: Clause<ProgramInviteEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: programId },
  ];
  const programInviteClient = await useTableClient(AzureTable.ProgramInvites);
  const invites = await getTopNEntities(programInviteClient, AZURE_MAX_PAGE_SIZE, ProgramInviteEntity, {
    filter: serializeClauses(inviteClauses),
  });
  // A deleted or unbound survey leaves the invites readable with nothing responded — the same
  // Fail-soft posture as every dangling reference
  const content = await readResourceContent(programResourceSchema, programId);
  const respondedTokens = new Set<string>();
  if (content?.surveyId) {
    const surveyResponses = await readSurveyResponseEntities(content.surveyId);
    for (const { inviteToken } of surveyResponses) if (inviteToken) respondedTokens.add(inviteToken);
  }
  return invites.map(({ createdAt, keyValue, publicId, rowKey }) => ({
    invitedAt: createdAt,
    isResponded: respondedTokens.has(rowKey),
    keyValue,
    publicId,
    token: rowKey,
  }));
};
