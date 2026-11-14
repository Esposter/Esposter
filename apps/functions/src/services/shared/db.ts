import type { Database } from "@esposter/db-schema";

import { relations } from "@esposter/db-schema";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

export const db: Database = drizzle(env.CORE, { relations });
