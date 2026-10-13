import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { readProgramParticipantEntities } from "#server/services/program/readProgramParticipantEntities";
import { readBoundProgramIds } from "#server/services/survey/readBoundProgramIds";
import { AZURE_MAX_PAGE_SIZE } from "@esposter/azure";

// An Identified survey's respondents, keyed by the token they answered with. The identifier is the participant's
// Its publicId, the non-secret one the Program's status dataset publishes too — never keyValue, which is the recipient's
// Identity, and never the token, which is the credential survey writes accept. A program read that filled the cap
// May have left out a respondent, so the caller is told rather than shown a blank cell as "no respondent"
export const readSurveyRespondents = async (
  db: Context["db"],
  survey: Pick<ResourceInResource, "id" | "userId">,
): Promise<{ isPartial: boolean; respondentIds: Map<string, string> }> => {
  const programIds = await readBoundProgramIds(db, survey);
  const participantLists = await Promise.all(programIds.map((programId) => readProgramParticipantEntities(programId)));
  const participants = participantLists.flat();
  return {
    isPartial: participantLists.some((list) => list.length >= AZURE_MAX_PAGE_SIZE),
    respondentIds: new Map(participants.map(({ publicId, token }) => [token, publicId])),
  };
};
