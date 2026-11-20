import type { CallParticipantRow } from "@esposter/db-schema";

// A participant row the overlay holds. The row is the call object's, and the call it belongs to rides beside it: one table holds
// The participants of every call the client has open, and a participant's id is unique across them
export type HeldCallParticipant = CallParticipantRow & { callSessionId: string };
