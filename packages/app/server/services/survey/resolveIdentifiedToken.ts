import type { SurveyResponseModeValidator } from "@@/server/models/survey/SurveyResponseModeValidator";
import type { Clause } from "@esposter/azure";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { invalidParticipantTokenError } from "@@/server/services/survey/invalidParticipantTokenError";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import { AzureTable, ProgramParticipantEntity, ResourceType } from "@esposter/db-schema";

// The program is the issuer, the survey is the gate — a token only passes when it was issued by a
// Program actually bound to this survey, so another survey's token is as good as a forged one
export const resolveIdentifiedToken: SurveyResponseModeValidator = async (db, surveyId, participantToken) => {
  if (!participantToken) throw invalidParticipantTokenError();

  const survey = await db.query.resources.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw invalidParticipantTokenError();
  // Only the survey's owner can bind it to a program, so their programs are the whole candidate set.
  // A recycle-binned program stays in the set: its token links were already distributed to participants,
  // And only an actual purge — not a recoverable soft-delete — should invalidate them.
  //
  // The binding is a column, written in the same transaction as the content it is projected from, so the whole
  // Candidate set is one indexed lookup. Reading it out of blob content instead opens every Program the owner
  // Has on every submission to an identified survey — by an unauthenticated caller, at that.
  const boundPrograms = await db.query.resources.findMany({
    where: {
      boundResourceId: { eq: surveyId },
      type: { eq: ResourceType.Program },
      userId: { eq: survey.userId },
    },
  });
  // Programs whose content predates the column have no binding projected yet, so they are still resolved the
  // Old way until the backfill (or their owner's next save) reaches them. Scoped to exactly those rows, so it
  // Costs nothing once none are left — and dropping it instead would reject every already-issued token on a
  // Deploy where the backfill has not run
  const unprojectedPrograms = await db.query.resources.findMany({
    where: {
      boundResourceId: { isNull: true },
      type: { eq: ResourceType.Program },
      userId: { eq: survey.userId },
    },
  });
  if (unprojectedPrograms.length > 0) {
    const contents = await Promise.all(
      unprojectedPrograms.map(({ id }) => readResourceContent(programResourceSchema, id)),
    );
    boundPrograms.push(...unprojectedPrograms.filter((_program, index) => contents[index]?.surveyId === surveyId));
  }
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
  throw invalidParticipantTokenError();
};
