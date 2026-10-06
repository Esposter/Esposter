import type { ProgramStatusParticipantRow } from "#server/models/program/ProgramStatusParticipantRow";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { readProgramParticipantEntities } from "#server/services/program/readProgramParticipantEntities";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { readSurveyResponseEntities } from "#server/services/survey/readSurveyResponseEntities";
import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { ResourceType } from "@esposter/db-schema";

// The canonical participants × responses join, purpose-built rather than routed through a generic join engine.
// A response with no matching participant (an anonymous-era row) carries nobody, so it never appears here
export const readProgramStatusRows = async (
  db: Context["db"],
  { id: programId, userId }: Pick<ResourceInResource, "id" | "userId">,
): Promise<{ isRespondedPartial: boolean; rows: ProgramStatusParticipantRow[] }> => {
  // A deleted or unbound survey leaves the participants readable with nothing responded — the same
  // Fail-soft posture as every dangling reference. Neither read needs the other, so they overlap
  const [participants, content] = await Promise.all([
    readProgramParticipantEntities(programId),
    readResourceContent(programResourceSchema, programId),
  ]);
  const respondedTokens = new Set<string>();
  // The response read is capped, and a token past that cap is indistinguishable from one that never responded —
  // So a truncated read under-reports `isResponded` rather than failing. The caller is told, because "3 of 900
  // Responded" is a claim the surface cannot make honestly without knowing whether it saw every response
  let isRespondedPartial = false;
  // Only a live survey the program's owner also owns. The content can name any survey id, and another owner's
  // Responses are theirs to read — nor could one ever match, since only the survey owner's programs issue its tokens.
  // A binned survey is gone to every binding, as it is to the respondent its links open on
  const survey = content?.surveyId
    ? await db.query.resourcesInResource.findFirst({
        columns: { id: true },
        where: {
          deletedAt: { isNull: true },
          id: { eq: content.surveyId },
          type: { eq: ResourceType.Survey },
          userId: { eq: userId },
        },
      })
    : undefined;
  if (survey) {
    const { hasMore, surveyResponses } = await readSurveyResponseEntities(survey.id);
    isRespondedPartial = hasMore;
    for (const { participantToken } of surveyResponses) if (participantToken) respondedTokens.add(participantToken);
  }
  // The token is what the join matches on, never something it carries out — no consumer of this row has any
  // Use for the credential itself
  return {
    isRespondedPartial,
    rows: participants.map(({ createdAt, keyValue, publicId, token }) => ({
      addedAt: createdAt,
      isResponded: respondedTokens.has(token),
      keyValue,
      publicId,
    })),
  };
};
