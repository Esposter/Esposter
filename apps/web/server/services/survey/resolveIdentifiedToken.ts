import type { SurveyResponseModeValidator } from "#server/models/survey/SurveyResponseModeValidator";
import type { Clause } from "@esposter/azure";

import { useTableClient } from "#server/composables/azure/table/useTableClient";
import { getInvalidParticipantTokenError } from "#server/services/survey/getInvalidParticipantTokenError";
import { BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { getTopNEntities } from "@esposter/db";
import { AzureTable, ProgramParticipantEntity, ResourceLinkType, ResourceType } from "@esposter/db-schema";

// The program is the issuer, the survey is the gate — a token only passes when it was issued by a
// Program actually bound to this survey, so another survey's token is as good as a forged one
export const resolveIdentifiedToken: SurveyResponseModeValidator = async (db, surveyId, participantToken) => {
  if (!participantToken) throw getInvalidParticipantTokenError();

  const survey = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw getInvalidParticipantTokenError();
  // Only the survey's owner can bind it to a program, so their programs are the whole candidate set.
  // A recycle-binned program stays in the set: its token links were already distributed to participants,
  // And only an actual purge — not a recoverable soft-delete — should invalidate them.
  //
  // A Program binds its survey as a Survey link, kept in step with its content on every save, so the whole
  // Candidate set is one indexed lookup. The role is what decides it: a Program whose audience is this survey's
  // Responses holds a Dataset link to it, which issues no tokens for it (/docs/architecture/resource-links)
  const boundPrograms = await db.query.resourcesInResource.findMany({
    where: {
      links: { targetId: { eq: surveyId }, type: { eq: ResourceLinkType.Survey } },
      type: { eq: ResourceType.Program },
      userId: { eq: survey.userId },
    },
  });
  const programParticipantClient = await useTableClient(AzureTable.ProgramParticipants);
  // The token is a column rather than the key, so each program is a single-partition scan for one row — the
  // Recipient's identity owns the key, and only one of the two can. No scan reads another's, so they overlap
  const participantPages = await Promise.all(
    boundPrograms.map(({ id }) => {
      const clauses: Clause<ProgramParticipantEntity>[] = [
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: id },
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
