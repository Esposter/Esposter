import type { RequestEvent } from "nuxt/server";

import { readSession } from "#server/services/auth/readSession";
import { createError } from "nuxt/server";

// The session a socket upgrade carries. A browser sends its page's Origin on every WebSocket handshake, and the session
// Cookie with it even when another site opened the socket, so an Origin other than this app's is refused before the
// Cookie is read. An upgrade with no Origin is not a browser's cross-site handshake, and is read as any request is
export const readSocketSession = async (event: RequestEvent) => {
  const origin = event.req.headers.get("origin");
  if (origin !== null && origin !== event.url.origin) throw createError({ statusCode: 403 });

  const authSession = await readSession(event.req.headers);
  if (!authSession) throw createError({ statusCode: 401 });
  return authSession;
};
