import type { StreamTable, StreamTableEntityMap } from "@esposter/db-schema";

import { StreamTableClient } from "@esposter/db";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

// The streams database is the Worker's `STREAMS` D1 binding, and every table client reads it through its own handle
export const useStreamTableClient = <TStreamTable extends StreamTable>(tableName: TStreamTable) =>
  new StreamTableClient<StreamTableEntityMap[TStreamTable]>(drizzle(env.STREAMS), tableName);
