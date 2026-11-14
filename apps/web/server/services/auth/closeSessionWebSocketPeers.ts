import { webSocketPeerMap } from "#server/services/auth/webSocketPeerMap";

// A revoked session's sockets close with it, so the subscriptions they carry end rather than outliving the session. A
// Socket's own close hook takes it out of the map, and no other session's socket is touched
const SESSION_REVOKED_CLOSE_CODE = 1008;

export const closeSessionWebSocketPeers = (sessionId: string) => {
  for (const { peer, sessionId: peerSessionId } of webSocketPeerMap.values())
    if (peerSessionId === sessionId) peer.close(SESSION_REVOKED_CLOSE_CODE, "Session revoked");
};
