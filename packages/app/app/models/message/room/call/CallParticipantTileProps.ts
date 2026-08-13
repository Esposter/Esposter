import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export interface CallParticipantTileProps {
  isDeafened: boolean;
  isScreenSharing: boolean;
  isSelf: boolean;
  isSpeaking: boolean;
  participant: CallParticipant;
  videoStream?: MediaStream;
}
