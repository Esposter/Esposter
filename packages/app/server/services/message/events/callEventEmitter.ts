import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { EventEmitter } from "node:events";

interface CallEvents {
  joinCall: [{ callSessionId: string; participant: CallParticipant; sessionId: string }];
  knockCall: [{ callSessionId: string; knocker: CallParticipant; knockerSessionId: string }];
  knockerAdmitted: [{ callSessionId: string; knockerSessionId: string }];
  knockerDismissed: [{ callSessionId: string; knockerSessionId: string }];
  leaveCall: [{ callSessionId: string; id: string; sessionId: string }];
  muteChanged: [{ callSessionId: string; id: string; isMuted: boolean }];
  videoChanged: [{ callSessionId: string; id: string; isCameraEnabled: boolean }];
}

export const callEventEmitter = new EventEmitter<CallEvents>();
