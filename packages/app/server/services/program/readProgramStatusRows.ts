import type { ProgramStatusParticipantRow } from "@@/server/models/program/ProgramStatusParticipantRow";
import type { Resource } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getProgramParticipantFilter } from "@@/server/services/program/getProgramParticipantFilter";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { readSurveyResponseEntities } from "@@/server/services/survey/readSurveyResponseEntities";
import { getTopNEntities } from "@esposter/db";
import { AZURE_MAX_PAGE_SIZE, AzureTable, ProgramParticipantEntity } from "@esposter/db-schema";

// The canonical participants × responses join, purpose-built rather than routed through a generic join engine.
// A response with no matching participant (an anonymous-era row) carries nobody, so it never appears here
export const readProgramStatusRows = async (programId: Resource["id"]): Promise<ProgramStatusParticipantRow[]> => {
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  const participants = await getTopNEntities(programParticipantClient, AZURE_MAX_PAGE_SIZE, ProgramParticipantEntity, {
    filter: getProgramParticipantFilter(programId),
  });
  // A deleted or unbound survey leaves the participants readable with nothing responded — the same
  // Fail-soft posture as every dangling reference
  const content = await readResourceContent(programResourceSchema, programId);
  const respondedTokens = new Set<string>();
  if (content?.surveyId) {
    const { surveyResponses } = await readSurveyResponseEntities(content.surveyId);
    for (const { participantToken } of surveyResponses) if (participantToken) respondedTokens.add(participantToken);
  }
  // The token is what the join matches on, never something it carries out — no consumer of this row has any
  // Use for the credential itself
  return participants.map(({ createdAt, keyValue, publicId, token }) => ({
    addedAt: createdAt,
    isResponded: respondedTokens.has(token),
    keyValue,
    publicId,
  }));
};
