import type { DurableObjectStub } from "@cloudflare/workers-types";
import type { SocketIdentity } from "@esposter/db-schema";
import type { RequestEvent } from "nuxt/server";

import { SOCKET_IDENTITY_HEADER, SOCKET_IDENTITY_HEADER_PREFIX } from "@esposter/db-schema";

// Forwards a socket's upgrade to the object that holds it, with the identity the Worker verified. Every identity header the
// Client sent is dropped first, so the object reads only the identity written here. An upgrade is a bodiless GET, so its
// Address and headers are the whole request.
// @TODO: https://github.com/h3js/h3/pull/1629 — h3 2.0.8 rebuilds a returned response that has prepared headers to merge,
// And the rebuild drops the object's socket, so the headers prepared before the handler are cleared here and the headers
// Rule that writes after it is removed on `/ws/**` (`configuration/routeRules.ts`)
export const forwardSocket = (event: RequestEvent, stub: DurableObjectStub, identity: SocketIdentity) => {
  // The names are copied first, since deleting from the headers while iterating them skips the name after each one deleted
  for (const name of new Set(event.res.headers.keys())) event.res.headers.delete(name);
  return stub.fetch(event.req.url, {
    headers: {
      ...Object.fromEntries([...event.req.headers].filter(([name]) => !name.startsWith(SOCKET_IDENTITY_HEADER_PREFIX))),
      [SOCKET_IDENTITY_HEADER.deviceId]: identity.deviceId,
      [SOCKET_IDENTITY_HEADER.sessionExpiresAt]: String(identity.sessionExpiresAt),
      [SOCKET_IDENTITY_HEADER.sessionId]: identity.sessionId,
      [SOCKET_IDENTITY_HEADER.userId]: identity.userId,
    },
  });
};
