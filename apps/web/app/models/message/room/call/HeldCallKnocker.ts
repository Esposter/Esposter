import type { CallParticipantRow } from "@esposter/db-schema";

// A knocker row the overlay holds. The row is the call object's, and the call it knocks on rides beside it, so the
// Lobby Shows only the knockers of the call the doorkeeper is in
export type HeldCallKnocker = { callSessionId: string } & CallParticipantRow;
