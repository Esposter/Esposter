import type { SurveyResponseModeValidator } from "@@/server/models/survey/SurveyResponseModeValidator";
import type { Clause } from "@esposter/db-schema";

import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { invalidInviteTokenError } from "@@/server/services/survey/invalidInviteTokenError";
import { getTopNEntities, serializeClauses } from "@esposter/db";
import {
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  ProgramInviteEntity,
  ResourceType,
} from "@esposter/db-schema";

// The program is the issuer, the survey is the gate — a token only passes when it was issued by a
// Program actually bound to this survey, so another survey's token is as good as a forged one
export const resolveInvitedToken: SurveyResponseModeValidator = async (db, surveyId, inviteToken) => {
  if (!inviteToken) throw invalidInviteTokenError();

  const survey = await db.query.resources.findFirst({
    where: { id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw invalidInviteTokenError();

  // Only the survey's owner can bind it to a program, so their programs are the whole candidate set
  const programs = await db.query.resources.findMany({
    where: { type: { eq: ResourceType.Program }, userId: { eq: survey.userId } },
  });
  const programInviteClient = await useTableClient(AzureTable.ProgramInvites);
  for (const program of programs) {
    const content = await readResourceContent(programResourceSchema, program.id);
    if (content?.surveyId !== surveyId) continue;

    // The token is a column rather than the key, so this is a single-partition scan for one row —
    // The recipient's identity owns the key, and only one of the two can
    const clauses: Clause<ProgramInviteEntity>[] = [
      { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: program.id },
      { key: "token", operator: BinaryOperator.eq, value: inviteToken },
    ];
    const [invite] = await getTopNEntities(programInviteClient, 1, ProgramInviteEntity, {
      filter: serializeClauses(clauses),
    });
    if (invite) return inviteToken;
  }
  throw invalidInviteTokenError();
};
