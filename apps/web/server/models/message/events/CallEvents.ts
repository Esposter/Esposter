import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export interface CallEvents {
  handRaisedChanged: [{ callSessionId: string; id: string; isHandRaised: boolean }];
  joinCall: [{ callSessionId: string; participant: CallParticipant; sessionId: string }];
  knockCall: [{ callSessionId: string; knocker: CallParticipant }];
  knockerAdmitted: [{ callSessionId: string; knockerSessionId: string }];
  knockerDismissed: [{ callSessionId: string; knockerSessionId: string }];
  leaveCall: [{ callSessionId: string; id: string }];
  muteChanged: [{ callSessionId: string; id: string; isMuted: boolean }];
  videoChanged: [{ callSessionId: string; id: string; isCameraEnabled: boolean }];
}
