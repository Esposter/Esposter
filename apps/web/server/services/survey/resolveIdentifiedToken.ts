import type { SurveyResponseModeValidator } from "#server/models/survey/SurveyResponseModeValidator";
import type { Clause } from "@esposter/azure";

import { useTableClient } from "#server/composables/azure/table/useTableClient";
import { getInvalidParticipantTokenError } from "#server/services/survey/getInvalidParticipantTokenError";
import { readBoundProgramIds } from "#server/services/survey/readBoundProgramIds";
import { BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { getTopNEntities } from "@esposter/db";
import { AzureTable, ProgramParticipantEntity, ResourceType } from "@esposter/db-schema";

// The program is the issuer, the survey is the gate — a token only passes when it was issued by a
// Program actually bound to this survey, so another survey's token is as good as a forged one
export const resolveIdentifiedToken: SurveyResponseModeValidator = async (db, surveyId, participantToken) => {
  if (!participantToken) throw getInvalidParticipantTokenError();

  const survey = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw getInvalidParticipantTokenError();
  // A recycle-binned program stays in the set: its token links were already distributed to participants,
  // And only an actual purge — not a recoverable soft-delete — should invalidate them.
  const boundProgramIds = await readBoundProgramIds(db, survey);
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  // The token is a column rather than the key, so each program is a single-partition scan for one row — the
  // Recipient's identity owns the key, and only one of the two can. No scan reads another's, so they overlap
  const participantPages = await Promise.all(
    boundProgramIds.map((programId) => {
      const clauses: Clause<ProgramParticipantEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: programId },
        { key: "token", operator: BinaryOperator.Eq, value: participantToken },
      ];
      return getTopNEntities(programParticipantClient, 1, ProgramParticipantEntity, {
        filter: serializeClauses(clauses),
      });
    }),
  );
  if (participantPages.some((participants) => participants.length > 0)) return participantToken;
  throw getInvalidParticipantTokenError();
};
