import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { schema } from "@/schema";
import { messageSchema } from "@/schema/messageSchema";
import "@/util/bigintPolyfill";
import { PGlite } from "@electric-sql/pglite";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

export const createMockDb = async (): Promise<PostgresJsDatabase<typeof schema>> => {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await db.execute(sql.raw(`CREATE SCHEMA "${messageSchema.schemaName}"`));
  const previousJson = generateDrizzleJson({});
  const currentJson = generateDrizzleJson(schema, previousJson.id);
  const statements = await generateMigration(previousJson, currentJson);
  for (const statement of statements) await db.execute(statement);
  return db as unknown as PostgresJsDatabase<typeof schema>;
};
