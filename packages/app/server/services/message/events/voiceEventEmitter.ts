import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";
import type { VoiceSignalPayload } from "#shared/models/room/voice/VoiceSignalPayload";

import { EventEmitter } from "node:events";

interface VoiceEvents {
  joinVoiceChannel: [{ participant: VoiceParticipant; roomId: string; sessionId: string }];
  leaveVoiceChannel: [{ id: string; roomId: string; sessionId: string }];
  muteChanged: [{ id: string; isMuted: boolean; roomId: string }];
  signal: [{ payload: VoiceSignalPayload; roomId: string; senderId: string }];
}

export const voiceEventEmitter = new EventEmitter<VoiceEvents>();
