import { PGlite } from "@electric-sql/pglite";
import { KIBIBYTE } from "@esposter/configuration";
import { messageSchema, relations, schema } from "@esposter/db-schema";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api-postgres";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { SNAPSHOT_FILENAME } from "../src/constants";

const client = new PGlite();
const db = drizzle({ client, relations });
await db.execute(sql.raw(`CREATE SCHEMA "${messageSchema.schemaName}"`));
const previousJson = await generateDrizzleJson({});
const statements = await generateMigration(previousJson, await generateDrizzleJson(schema, previousJson.id));
for (const statement of statements) await db.execute(statement);

const dump = await client.dumpDataDir("gzip");
const buffer = Buffer.from(await dump.arrayBuffer());
const output = fileURLToPath(new URL(`../src/${SNAPSHOT_FILENAME}`, import.meta.url));
await writeFile(output, buffer);
console.log(`Wrote ${output} (${(buffer.length / KIBIBYTE).toFixed(1)} KB, ${statements.length} statements)`);
