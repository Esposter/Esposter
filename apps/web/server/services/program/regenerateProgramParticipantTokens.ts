import type { Context } from "#server/trpc/context";
import type { ProgramParticipantInResource } from "@esposter/db-schema";

import { PROGRAM_PARTICIPANT_BATCH_SIZE } from "#server/services/program/constants";
import { programParticipantsInResource, surveyResponsesInResource } from "@esposter/db-schema";
import { chunk, generateSecretToken, hashSecretToken } from "@esposter/shared";
import { and, eq, exists } from "drizzle-orm";

// Replaces each participant's credential with a new one, and re-keys the responses it answered under to the new hash, so
// Its answers stay its own. The two writes are one batch per participant, so they land together or not at all, and the
// Response write only matches once the participant write has landed. A participant whose credential moved since it was
// Read matches nothing, so it is left as it is and is not in the result. The old credential stops working with the write
export const regenerateProgramParticipantTokens = async (
  db: Context["db"],
  participants: Pick<ProgramParticipantInResource, "id" | "tokenHash">[],
): Promise<{ id: ProgramParticipantInResource["id"]; token: string }[]> => {
  const regenerations: { id: ProgramParticipantInResource["id"]; token: string }[] = [];
  for (const batch of chunk(participants, PROGRAM_PARTICIPANT_BATCH_SIZE)) {
    const batchRegenerations = await Promise.all(
      batch.map(async ({ id, tokenHash }) => {
        const token = generateSecretToken();
        const newTokenHash = await hashSecretToken(token);
        const [participantRows] = await db.batch([
          db
            .update(programParticipantsInResource)
            .set({ tokenHash: newTokenHash })
            .where(
              and(eq(programParticipantsInResource.id, id), eq(programParticipantsInResource.tokenHash, tokenHash)),
            )
            .returning({ id: programParticipantsInResource.id }),
          db
            .update(surveyResponsesInResource)
            .set({ participantTokenHash: newTokenHash })
            .where(
              and(
                eq(surveyResponsesInResource.participantTokenHash, tokenHash),
                exists(
                  db
                    .select({ id: programParticipantsInResource.id })
                    .from(programParticipantsInResource)
                    .where(eq(programParticipantsInResource.tokenHash, newTokenHash)),
                ),
              ),
            ),
        ]);
        return participantRows.length > 0 ? { id, token } : undefined;
      }),
    );
    regenerations.push(...batchRegenerations.filter((regeneration) => regeneration !== undefined));
  }
  return regenerations;
};
