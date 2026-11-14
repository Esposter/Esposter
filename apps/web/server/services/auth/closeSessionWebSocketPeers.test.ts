import { closeSessionWebSocketPeers } from "#server/services/auth/closeSessionWebSocketPeers";
import { createMockWebSocketPeer } from "#server/services/auth/createMockWebSocketPeer.test";
import { webSocketPeerMap } from "#server/services/auth/webSocketPeerMap";
import { afterEach, describe, expect, test } from "vitest";

describe(closeSessionWebSocketPeers, () => {
  const sessionId = crypto.randomUUID();
  const otherSessionId = crypto.randomUUID();

  afterEach(() => {
    webSocketPeerMap.clear();
  });

  test("closes every socket the session holds, and no other session's", () => {
    expect.hasAssertions();

    const peer = createMockWebSocketPeer();
    const otherPeer = createMockWebSocketPeer();
    const otherSessionPeer = createMockWebSocketPeer();
    webSocketPeerMap.set(crypto.randomUUID(), { peer, sessionId });
    webSocketPeerMap.set(crypto.randomUUID(), { peer: otherPeer, sessionId });
    webSocketPeerMap.set(crypto.randomUUID(), { peer: otherSessionPeer, sessionId: otherSessionId });

    closeSessionWebSocketPeers(sessionId);

    expect(peer.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherPeer.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(otherSessionPeer.close).not.toHaveBeenCalled();
  });
});
