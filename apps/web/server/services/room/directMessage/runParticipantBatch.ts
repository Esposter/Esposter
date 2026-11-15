import { checkIsUniqueViolation } from "#server/services/db/checkIsUniqueViolation";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// A batch that writes a direct message's participant key meets UNIQUE(rooms.participantKey) when another direct message
// Already holds the participant set it asks for. That is a refusal the caller can act on, not a database fault
export const runParticipantBatch = <T>(batch: () => Promise<T>): Promise<T> =>
  getResultAsync(batch).match(
    (results) => results,
    (error) => {
      if (checkIsUniqueViolation(error))
        throw new TRPCError({ code: "CONFLICT", message: "Another direct message already has these participants" });
      throw error;
    },
  );
