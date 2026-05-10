import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

// RoomId -> participantId -> VoiceParticipant
export const voiceRoomParticipantMap = new Map<string, Map<string, VoiceParticipant>>();
