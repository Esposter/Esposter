import type { SocketIdentity } from "@esposter/db-schema";

import { SOCKET_IDENTITY_HEADER } from "@esposter/db-schema";

// The identity the web Worker forwarded with the upgrade. A socket without every part is not a socket an object accepts
export const readSocketIdentity = (headers: Headers): null | SocketIdentity => {
  const deviceId = headers.get(SOCKET_IDENTITY_HEADER.deviceId);
  const sessionExpiresAt = Number(headers.get(SOCKET_IDENTITY_HEADER.sessionExpiresAt));
  const sessionId = headers.get(SOCKET_IDENTITY_HEADER.sessionId);
  const userId = headers.get(SOCKET_IDENTITY_HEADER.userId);
  return deviceId && sessionExpiresAt > 0 && sessionId && userId
    ? { deviceId, sessionExpiresAt, sessionId, userId }
    : null;
};
