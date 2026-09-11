import type { Database } from "@esposter/db-schema";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { H3Event } from "h3";

import { db } from "@@/server/db";
import { getRequestHeaders } from "@@/server/services/request/getRequestHeaders";

type ContextInput = CreateWSSContextFnOptions | H3EventInput;
// `trpc-nuxt` bundles its own copy of h3's H3Event declaration, which misses nitro's augmentations, so we
// Structurally accept only the members we read instead of h3's H3Event itself.
type H3EventInput = Pick<H3Event, "headers" | "node">;

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
