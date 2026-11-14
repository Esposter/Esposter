import { DrizzleLogger } from "#server/db/logger";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { relations } from "@esposter/db-schema";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

export const db = drizzle(env.CORE, { logger: IS_PRODUCTION ? undefined : new DrizzleLogger(), relations });
