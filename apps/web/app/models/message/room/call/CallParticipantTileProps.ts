import type { CallParticipant } from "@esposter/db-schema";

export interface CallParticipantTileProps {
  isDeafened: boolean;
  isScreenSharing: boolean;
  isSelf: boolean;
  isSpeaking: boolean;
  participant: CallParticipant;
  videoStream?: MediaStream;
}
