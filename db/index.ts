import { MIGRATIONS_FOLDER_PATH } from "@/db/constants";
import { DrizzleLogger } from "@/db/logger";
import * as accounts from "@/db/schema/accounts";
import * as posts from "@/db/schema/posts";
import * as rooms from "@/db/schema/rooms";
import * as sessions from "@/db/schema/sessions";
import * as surveys from "@/db/schema/surveys";
import * as users from "@/db/schema/users";
import * as verificationTokens from "@/db/schema/verificationTokens";
import { env } from "@/env.server";
import { IS_PRODUCTION } from "@/util/environment/constants";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, {
  schema: {
    ...accounts,
    ...posts,
    ...rooms,
    ...sessions,
    ...surveys,
    ...users,
    ...verificationTokens,
  },
  logger: !IS_PRODUCTION ? new DrizzleLogger() : undefined,
});

await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER_PATH });
