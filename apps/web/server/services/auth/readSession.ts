import type { ServerResponse } from "node:http";

import { auth } from "@@/server/auth";

// The session a request carries. Better-auth extends a session read a day after its last extension and sends the
// Extended cookie back, so a read whose response can carry that cookie forwards it, and any other read, such as a
// Socket's or a cached asset's, leaves the extension alone: taken there, the database would move the expiry on while
// The browser's cookie kept the old one and lapsed a week after sign-in however often the reader came back
// (https://github.com/better-auth/better-auth/issues/2115)
export const readSession = async (headers: Headers, response?: ServerResponse) => {
  if (!response) return auth.api.getSession({ headers, query: { disableRefresh: true } });

  const { headers: responseHeaders, response: getSessionPayload } = await auth.api.getSession({
    headers,
    returnHeaders: true,
  });
  const cookies = responseHeaders.getSetCookie();
  if (cookies.length > 0) response.appendHeader("Set-Cookie", cookies);
  return getSessionPayload;
};
