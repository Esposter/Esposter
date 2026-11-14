import type { SocketIdentity } from "@esposter/db-schema";

import { SOCKET_IDENTITY_HEADER } from "@esposter/db-schema";

// The identity the web Worker forwarded with the upgrade. A socket without all three is not a socket an object accepts
export const readSocketIdentity = (headers: Headers): SocketIdentity | null => {
  const deviceId = headers.get(SOCKET_IDENTITY_HEADER.deviceId);
  const sessionId = headers.get(SOCKET_IDENTITY_HEADER.sessionId);
  const userId = headers.get(SOCKET_IDENTITY_HEADER.userId);
  return deviceId && sessionId && userId ? { deviceId, sessionId, userId } : null;
};
