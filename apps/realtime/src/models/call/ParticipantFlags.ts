import type { CallParticipant } from "@esposter/db-schema";

// The flags a participant's controls write, any of them in one update
export type ParticipantFlags = Partial<Pick<CallParticipant, "isCameraEnabled" | "isHandRaised" | "isMuted">>;
