import type { SurveyResponseModeValidator } from "@@/server/models/survey/SurveyResponseModeValidator";
import type { Clause } from "@esposter/azure";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getInvalidParticipantTokenError } from "@@/server/services/survey/getInvalidParticipantTokenError";
import { BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { getTopNEntities } from "@esposter/db";
import { AzureTable, ProgramParticipantEntity, ResourceType } from "@esposter/db-schema";

// The program is the issuer, the survey is the gate — a token only passes when it was issued by a
// Program actually bound to this survey, so another survey's token is as good as a forged one
export const resolveIdentifiedToken: SurveyResponseModeValidator = async (db, surveyId, participantToken) => {
  if (!participantToken) throw getInvalidParticipantTokenError();

  const survey = await db.query.resources.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw getInvalidParticipantTokenError();
  // Only the survey's owner can bind it to a program, so their programs are the whole candidate set.
  // A recycle-binned program stays in the set: its token links were already distributed to participants,
  // And only an actual purge — not a recoverable soft-delete — should invalidate them.
  //
  // The binding is a column, written in the same transaction as the content it is projected from, so the whole
  // Candidate set is one indexed lookup (ResourceBoundResourceIdMap)
  const boundPrograms = await db.query.resources.findMany({
    where: {
      boundResourceId: { eq: surveyId },
      type: { eq: ResourceType.Program },
      userId: { eq: survey.userId },
    },
  });
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  for (const boundProgram of boundPrograms) {
    // The token is a column rather than the key, so this is a single-partition scan for one row —
    // The recipient's identity owns the key, and only one of the two can
    const clauses: Clause<ProgramParticipantEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: boundProgram.id },
      { key: "token", operator: BinaryOperator.eq, value: participantToken },
    ];
    const [participant] = await getTopNEntities(programParticipantClient, 1, ProgramParticipantEntity, {
      filter: serializeClauses(clauses),
    });
    if (participant) return participantToken;
  }
  throw getInvalidParticipantTokenError();
};
