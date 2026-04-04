import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { voiceRoomParticipantMap } from "@@/server/services/message/voice/voiceParticipantMap";

export const getRoomParticipants = (roomId: string): VoiceParticipant[] => {
  const participantMap = voiceRoomParticipantMap.get(roomId);
  return participantMap ? [...participantMap.values()] : [];
};
