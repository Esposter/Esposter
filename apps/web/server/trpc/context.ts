import type { ContextInput } from "@@/server/models/trpc/ContextInput";
import type { H3EventInput } from "@@/server/models/trpc/H3EventInput";
import type { Database } from "@esposter/db-schema";

import { db } from "@@/server/db";
import { getRequestHeaders } from "@@/server/services/request/getRequestHeaders";

const checkIsH3Event = (value: ContextInput): value is H3EventInput => "node" in value;
// Widened to the driver-agnostic handle here rather than at its export, because the migrator that runs at startup
// Wants the postgres-js handle itself. Every procedure and service reads `Context["db"]`, so this is the one
// Seam that lets the pglite handle the tests build stand in without a cast
const database: Database = db;

export const createContext = (options: ContextInput) => {
  if (checkIsH3Event(options)) {
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

export type Context = ReturnType<typeof createContext>;
