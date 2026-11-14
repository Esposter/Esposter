import type { CallParticipant } from "@esposter/db-schema";

export interface CallEvents {
  handRaisedChanged: [{ callSessionId: string; id: string; isHandRaised: boolean }];
  joinCall: [
    | { callSessionId: string; participant: CallParticipant; sessionId: string; type: "join" }
    // A revoke that narrows a connection replaces it, and hands only the connection's own user the token to rejoin with
    | { authToken: string; callSessionId: string; canPublishMicrophone: boolean; sessionId: string; type: "rejoin" },
  ];
  knockCall: [{ callSessionId: string; knocker: CallParticipant }];
  knockerAdmitted: [{ callSessionId: string; knockerSessionId: string }];
  knockerDismissed: [{ callSessionId: string; knockerSessionId: string }];
  leaveCall: [{ callSessionId: string; id: string }];
  muteChanged: [{ callSessionId: string; id: string; isMuted: boolean }];
  videoChanged: [{ callSessionId: string; id: string; isCameraEnabled: boolean }];
}
