import type { Context } from "#server/trpc/context";
import type { SurveyResponseModeValidator } from "#server/models/survey/SurveyResponseModeValidator";

import { getInvalidParticipantTokenError } from "#server/services/survey/getInvalidParticipantTokenError";
import { readBoundProgramIds } from "#server/services/survey/readBoundProgramIds";
import { programParticipantsInResource, ResourceType, resourcesInResource } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

// The program is the issuer, the survey is the gate — a token only passes when it was issued by a
// Program actually bound to this survey, so another survey's token is as good as a forged one
export const resolveIdentifiedToken: SurveyResponseModeValidator = async (
  db: Context["db"],
  surveyId,
  participantToken,
) => {
  if (!participantToken) throw getInvalidParticipantTokenError();

  const survey = await db.query.resourcesInResource.findFirst({
    where: { deletedAt: { isNull: true }, id: { eq: surveyId }, type: { eq: ResourceType.Survey } },
  });
  if (!survey) throw getInvalidParticipantTokenError();
  // A recycle-binned program stays in the set: its token links were already distributed to participants,
  // And only an actual purge — not a recoverable soft-delete — should invalidate them.
  const boundProgramIds = await readBoundProgramIds(db, survey);
  // The token is unique across every program, so one indexed lookup answers it, and the bound programs decide whether
  // its issuer may answer this survey
  const participants =
    boundProgramIds.length === 0
      ? []
      : await db
          .select({ id: programParticipantsInResource.id })
          .from(programParticipantsInResource)
          .where(
            and(
              eq(programParticipantsInResource.token, participantToken),
              inArray(programParticipantsInResource.resourceId, boundProgramIds),
            ),
          )
          .limit(1);
  if (participants.length > 0) return participantToken;
  throw getInvalidParticipantTokenError();
};
