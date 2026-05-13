import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallSignalPayload } from "#shared/models/room/call/CallSignalPayload";

import { EventEmitter } from "node:events";

interface CallEvents {
  joinCall: [{ callSessionId: string; participant: CallParticipant; sessionId: string }];
  leaveCall: [{ callSessionId: string; id: string; sessionId: string }];
  muteChanged: [{ callSessionId: string; id: string; isMuted: boolean }];
  signal: [{ callSessionId: string; payload: CallSignalPayload; senderId: string }];
}

export const callEventEmitter = new EventEmitter<CallEvents>();
