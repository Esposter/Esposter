import type { DurableObjectStub } from "@cloudflare/workers-types";
import type { SocketIdentity } from "@esposter/db-schema";

import { SOCKET_IDENTITY_HEADER, SOCKET_IDENTITY_HEADER_PREFIX } from "@esposter/db-schema";

// Forwards a socket's upgrade to the object that holds it, with the identity the Worker verified. Every identity header the
// Client sent is dropped first, so the object reads only the identity written here. An upgrade is a bodiless GET, so its
// Address and headers are the whole request
export const forwardSocket = (stub: DurableObjectStub, request: Request, identity: SocketIdentity) =>
  stub.fetch(request.url, {
    headers: {
      ...Object.fromEntries([...request.headers].filter(([name]) => !name.startsWith(SOCKET_IDENTITY_HEADER_PREFIX))),
      [SOCKET_IDENTITY_HEADER.deviceId]: identity.deviceId,
      [SOCKET_IDENTITY_HEADER.sessionId]: identity.sessionId,
      [SOCKET_IDENTITY_HEADER.userId]: identity.userId,
    },
  });
