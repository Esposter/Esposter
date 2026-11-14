import { getSynchronizedFunction } from "@esposter/shared";
import { drizzle } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";

// An object's SQLite through Drizzle, migrated before its first request is served.
// The constructor's block holds every event until the migrations have run, so a request never sees a missing table
export const createDurableObjectDatabase = (ctx: DurableObjectState, migrations: Record<string, string>) => {
  const db = drizzle(ctx.storage);
  // Promise.try turns a synchronous throw into a rejection, as an async body did, so the block sees the same outcome
  // Nothing awaits the block, since the runtime holds every event behind it: it is the sanctioned fire-and-forget
  getSynchronizedFunction(() => ctx.blockConcurrencyWhile(() => Promise.try(() => migrate(db, { migrations }))))();
  return db;
};
