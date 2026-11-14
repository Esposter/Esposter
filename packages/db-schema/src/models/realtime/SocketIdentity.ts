// The identity a socket's upgrade is forwarded with. Only the web Worker that read the session sets these headers, and
// The object reads its identity from them alone, so a client's own copy is stripped before the forward
export const SOCKET_IDENTITY_HEADER_PREFIX = "x-esposter-";

export const SOCKET_IDENTITY_HEADER = {
  deviceId: `${SOCKET_IDENTITY_HEADER_PREFIX}device-id`,
  sessionId: `${SOCKET_IDENTITY_HEADER_PREFIX}session-id`,
  userId: `${SOCKET_IDENTITY_HEADER_PREFIX}user-id`,
} as const;

export interface SocketIdentity {
  deviceId: string;
  sessionId: string;
  userId: string;
}
