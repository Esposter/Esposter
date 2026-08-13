import type { Database } from "@esposter/db-schema";

import { relations } from "@esposter/db-schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);
export const db: Database = drizzle({ client, relations });
