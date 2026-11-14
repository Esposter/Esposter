import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { readProgramParticipantEntities } from "#server/services/program/readProgramParticipantEntities";
import { readBoundProgramIds } from "#server/services/survey/readBoundProgramIds";
import { MAX_READ_LIMIT } from "@esposter/shared";

// An Identified survey's respondents, keyed by the hash of the token they answered with. The identifier is the
// Participant's publicId, the non-secret one the Program's status dataset publishes too — never keyValue, which is the
// Recipient's identity, and never the token's hash, which is what a response is keyed by. A program read that filled
// The cap may have left out a respondent, so the caller is told rather than shown a blank cell as "no respondent"
export const readSurveyRespondents = async (
  db: Context["db"],
  survey: Pick<ResourceInResource, "id" | "userId">,
): Promise<{ isPartial: boolean; respondentIds: Map<string, string> }> => {
  const programIds = await readBoundProgramIds(db, survey);
  const participantLists = await Promise.all(
    programIds.map((programId) => readProgramParticipantEntities(db, programId)),
  );
  const participants = participantLists.flat();
  return {
    isPartial: participantLists.some((list) => list.length >= MAX_READ_LIMIT),
    respondentIds: new Map(participants.map(({ publicId, tokenHash }) => [tokenHash, publicId])),
  };
};
