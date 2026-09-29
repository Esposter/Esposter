import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { ContextInput } from "@@/server/models/trpc/ContextInput";
import type { Database } from "@esposter/db-schema";

import { db } from "@@/server/db";
import { getRequestHeaders } from "@@/server/services/request/getRequestHeaders";
import { isEvent } from "h3";

// Widened to the driver-agnostic handle here rather than at its export, because the migrator that runs at startup
// Wants the postgres-js handle itself. Every procedure and service reads `Context["db"]`, so this is the one
// Seam that lets the pglite handle the tests build stand in without a cast
const database: Database = db;

export const createContext = (options: ContextInput) => {
  if (isEvent(options)) {
    const {
      headers,
      node: { req, res },
    } = options;
    return { db: database, headers, req, res };
  } else {
    const { req, res } = options;
    return { db: database, headers: getRequestHeaders(req), req, res };
  }
};

export type Context = ReturnType<typeof createContext> & {
  // A caller the route already authenticated another way, as the MCP route does an API key's owner, which the
  // Rate-limited middleware takes instead of reading a session from the cookie
  getSessionPayload?: GetSessionPayload;
};
