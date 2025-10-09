import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { schema } from "@esposter/db";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);
export const db: PostgresJsDatabase<typeof schema> = drizzle(client, { schema });
