import type { SocketIdentity } from "@esposter/db-schema";

import { SOCKET_IDENTITY_HEADER, SOCKET_IDENTITY_HEADER_PREFIX } from "@esposter/db-schema";

// Forwards a socket's upgrade to the object that holds it, with the identity the Worker verified. Every identity header the
// Client sent is dropped first, so the object reads only the identity written here
export const forwardSocket = (stub: DurableObjectStub, request: Request, identity: SocketIdentity) => {
  const headers = new Headers(request.headers);
  // The names are copied before any is deleted, so the loop does not read the headers it is changing
  const names = [...headers.keys()];
  for (const name of names) if (name.startsWith(SOCKET_IDENTITY_HEADER_PREFIX)) headers.delete(name);
  headers.set(SOCKET_IDENTITY_HEADER.deviceId, identity.deviceId);
  headers.set(SOCKET_IDENTITY_HEADER.sessionId, identity.sessionId);
  headers.set(SOCKET_IDENTITY_HEADER.userId, identity.userId);
  return stub.fetch(new Request(request, { headers }));
};
