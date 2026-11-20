import type { Entry } from "#src/models/shared/overlay/Entry";
import type { CallParticipant } from "@esposter/db-schema";

import { participantTable } from "#src/services/message/room/call/constants";

// A flag change the screen shows at once: the participant's row with the flags the write sets. A row the screen does not hold
// Yet has nothing to show the flag on, so the entry changes nothing until the row arrives
export const getParticipantFlagEntry =
  (
    participantId: string,
    flags: Partial<Pick<CallParticipant, "isCameraEnabled" | "isHandRaised" | "isMuted">>,
  ): Entry =>
  (view) => {
    const participant = view.get(participantTable, [participantId]);
    if (participant) view.set(participantTable, [participantId], { ...participant, ...flags });
  };
