import type { ContextInput } from "#server/models/trpc/ContextInput";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Database } from "@esposter/db-schema";

import { db } from "#server/db";
import { getIpAddress } from "#server/services/request/getIpAddress";
import { getRequestHeaders } from "#server/services/request/getRequestHeaders";
import { getRequestIP } from "nuxt/server";

// Widened to the driver-agnostic handle here rather than at its export, because the migrator that runs at startup
// Wants the postgres-js handle itself. Every procedure and service reads `Context["db"]`, so this is the one
// Seam that lets the pglite handle the tests build stand in without a cast
const database: Database = db;
// A request reaches a procedure as web headers whichever transport carried it, so nothing past this seam reads a node
// Request or response. Only an http request has a response whose headers a procedure can write; a socket's upgrade
// Response is long gone by the time a procedure runs
export const createContext = (options: ContextInput) => {
  if ("info" in options) {
    const headers = getRequestHeaders(options.req);
    return { db: database, headers, ipAddress: getIpAddress(headers, options.req.socket.remoteAddress ?? "") };
  } else {
    const { headers } = options.req;
    return {
      db: database,
      headers,
      ipAddress: getIpAddress(headers, getRequestIP(options) ?? ""),
      responseHeaders: options.res.headers,
    };
  }
};

export type Context = ReturnType<typeof createContext> & {
  // A caller the route already authenticated another way, as the MCP route does an API key's owner, which the
  // Rate-limited middleware takes instead of reading a session from the cookie
  getSessionPayload?: GetSessionPayload;
};
