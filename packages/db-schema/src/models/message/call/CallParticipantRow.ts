import type { CallParticipant } from "#src/models/message/call/CallParticipant";

import { callParticipantSchema } from "#src/models/message/call/CallParticipant";
import { z } from "zod";

// A connection's place in one call as the call object holds it: the participant, the version the object's last write left
// It at, and deletedAt once the connection has left. A departed connection stays a tombstone until the object purges it
export interface CallParticipantRow extends CallParticipant {
  deletedAt: Date | null;
  version: number;
}

export const callParticipantRowSchema = callParticipantSchema.extend({
  deletedAt: z.union([z.null(), z.coerce.date()]),
  version: z.int().nonnegative(),
}) satisfies z.ZodType<CallParticipantRow>;
