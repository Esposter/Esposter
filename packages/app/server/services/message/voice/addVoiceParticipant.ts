import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { voiceRoomParticipantMap } from "@@/server/services/message/voice/voiceParticipantMap";

export const addVoiceParticipant = (roomId: string, participant: VoiceParticipant): void => {
  const participantMap = voiceRoomParticipantMap.get(roomId) ?? new Map<string, VoiceParticipant>();
  participantMap.set(participant.id, participant);
  voiceRoomParticipantMap.set(roomId, participantMap);
};
