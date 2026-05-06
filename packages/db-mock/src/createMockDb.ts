import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import "@/util/bigintPolyfill";
import { PGlite } from "@electric-sql/pglite";
import { messageSchema, relations } from "@esposter/db-schema";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api-postgres";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

export const createMockDb = async (): Promise<PostgresJsDatabase<typeof relations>> => {
  const client = new PGlite();
  const db = drizzle({ client, relations });
  await db.execute(sql.raw(`CREATE SCHEMA "${messageSchema.schemaName}"`));
  const previousJson = await generateDrizzleJson({});
  const currentJson = await generateDrizzleJson(relations, previousJson.id);
  const statements = await generateMigration(previousJson, currentJson);
  for (const statement of statements) await db.execute(statement);
  return db as unknown as PostgresJsDatabase<typeof relations>;
};
