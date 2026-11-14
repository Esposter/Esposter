import type { AgentApiKey } from "#server/models/auth/AgentApiKey";
import type { Database } from "@esposter/db-schema";
import type { RequestEvent } from "nuxt/server";

import { db } from "#server/db";
import { readSession } from "#server/services/auth/readSession";
import { getIpAddress } from "#server/services/request/getIpAddress";
import { getRequestIP } from "nuxt/server";

// Widened to `Database`, which leaves out the D1 binding `drizzle` keeps as `$client`. Every procedure and service reads
// `Context["db"]`, so this is the one seam that lets the Miniflare handle the tests build stand in without a cast
const database: Database = db;
// The context of one request, a batch's calls sharing it. The caller is read here, once, from the session cookie: null
// When signed out. Better-auth extends a session a day after its last extension and sends the extended cookie back, so
// The read forwards that cookie on the response
export const createContext = async (event: RequestEvent) => {
  const { headers } = event.req;
  const responseHeaders = event.res.headers;
  const authSession = await readSession(headers, responseHeaders);
  return {
    db: database,
    headers,
    ipAddress: getIpAddress(headers, getRequestIP(event) ?? ""),
    responseHeaders,
    session: authSession?.session ?? null,
    user: authSession?.user ?? null,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>> & {
  // The key an agent's request came through, absent on a person's own request, so the activity trail can tell the two
  // Apart and name the key
  apiKey?: AgentApiKey;
};
