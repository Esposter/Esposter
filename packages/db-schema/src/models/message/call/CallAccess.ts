// What a connection holds on a call, read by the web Worker before it authorises a call operation against the object
export interface CallAccess {
  isAdmitted: boolean;
  isJoined: boolean;
  isKnocking: boolean;
  // The participant id the connection joined under, empty while it is not joined
  participantId: string;
}
