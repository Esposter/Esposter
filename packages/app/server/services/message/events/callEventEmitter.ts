import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallSignalPayload } from "#shared/models/room/call/CallSignalPayload";

import { EventEmitter } from "node:events";

interface CallEvents {
  joinCall: [{ participant: CallParticipant; roomId: string; sessionId: string }];
  leaveCall: [{ id: string; roomId: string; sessionId: string }];
  muteChanged: [{ id: string; isMuted: boolean; roomId: string }];
  signal: [{ payload: CallSignalPayload; roomId: string; senderId: string }];
}

export const callEventEmitter = new EventEmitter<CallEvents>();
