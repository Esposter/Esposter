import type { Middleware } from "nitro/h3";

import { defineMiddleware } from "nitro";
import { getCookie, HTTPError, setCookie } from "nitro/h3";

import { CSRF_TOKEN_BYTE_LENGTH, CSRF_UNSAFE_METHODS } from "#src/runtime/constants";
import { checkIsCsrfTokenValid } from "#src/runtime/services/checkIsCsrfTokenValid";
import { generateRandomToken } from "#src/runtime/services/generateRandomToken";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";

// The double submit cookie of the OWASP CSRF Prevention Cheat Sheet.
// A safe request is given a random token in a cookie. A state-changing request is refused with `403`
// Unless its header repeats that cookie, which a cross-site page cannot read to copy.
// The cookie is not HttpOnly, as the page's script is what copies it into the header
const csrf: Middleware = defineMiddleware((event) => {
  const rules = getSecurityRules(event);
  if (!rules?.enabled || !rules.csrf) return;

  const { cookieName, headerName } = rules.csrf;
  const cookieToken = getCookie(event, cookieName);
  if (!CSRF_UNSAFE_METHODS.includes(event.req.method)) {
    if (cookieToken === undefined)
      setCookie(event, cookieName, generateRandomToken(CSRF_TOKEN_BYTE_LENGTH), {
        httpOnly: false,
        path: "/",
        sameSite: "strict",
        secure: event.url.protocol === "https:",
      });
    return;
  }

  if (!checkIsCsrfTokenValid(cookieToken, event.req.headers.get(headerName)))
    throw new HTTPError({ status: 403, statusText: "Forbidden" });
});

export default csrf;
