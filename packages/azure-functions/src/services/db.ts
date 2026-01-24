import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { relations, schema } from "@esposter/db-schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);
export const db: PostgresJsDatabase<typeof schema, typeof relations> = drizzle({ client, relations, schema });
