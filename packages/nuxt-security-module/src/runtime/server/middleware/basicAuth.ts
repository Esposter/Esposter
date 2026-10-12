import type { Middleware } from "nitro/h3";

import { DEFAULT_BASIC_AUTH_REALM } from "#src/runtime/constants";
import { checkIsBasicAuthorized } from "#src/runtime/services/checkIsBasicAuthorized";
import { checkIsChallenged } from "#src/runtime/services/checkIsChallenged";
import { getBasicAuthOptions } from "#src/runtime/services/getBasicAuthOptions";
import { serializeBasicAuthChallenge } from "#src/runtime/services/serializeBasicAuthChallenge";
import { defineMiddleware } from "nitro";
import { HTTPError } from "nitro/h3";
import { useRuntimeConfig } from "nuxt/server";

// A challenged path without the right credentials is answered `401` with the `WWW-Authenticate` challenge.
// The credentials live in the server-only runtime config, read on each request, never in a route rule
const basicAuthMiddleware: Middleware = defineMiddleware((event) => {
  const basicAuth = getBasicAuthOptions(useRuntimeConfig().private);
  if (!basicAuth) return;

  const { pathname } = event.url;
  if (!checkIsChallenged(pathname, basicAuth)) return;
  if (checkIsBasicAuthorized(event.req.headers.get("authorization"), basicAuth)) return;

  event.res.headers.set("WWW-Authenticate", serializeBasicAuthChallenge(basicAuth.message || DEFAULT_BASIC_AUTH_REALM));
  throw new HTTPError({ status: 401, statusText: "Access denied" });
});

export default basicAuthMiddleware;
