import { drizzle } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";

// An object's SQLite through Drizzle, migrated before its first request is served: the constructor's block holds every
// event until the migrations have run, so a request never reads a table that is not there yet
export const createDurableObjectDatabase = (ctx: DurableObjectState, migrations: Record<string, string>) => {
  const db = drizzle(ctx.storage);
  void ctx.blockConcurrencyWhile(async () => {
    migrate(db, { migrations });
  });
  return db;
};
