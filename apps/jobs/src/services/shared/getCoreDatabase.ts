import type { Database } from "@esposter/db-schema";

import { relations } from "@esposter/db-schema";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

// Built on first use rather than when this module loads: the binding is read when a job runs, and a test installs it
// After The modules that import this one have loaded
let coreDatabase: Database | undefined;
export const getCoreDatabase = (): Database => (coreDatabase ??= drizzle(env.CORE, { relations }));
