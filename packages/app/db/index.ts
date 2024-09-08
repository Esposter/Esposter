import { MIGRATIONS_FOLDER_PATH } from "@/db/constants";
import { DrizzleLogger } from "@/db/logger";
import * as accounts from "@/db/schema/accounts";
import * as authenticators from "@/db/schema/authenticators";
import * as posts from "@/db/schema/posts";
import * as rooms from "@/db/schema/rooms";
import * as sessions from "@/db/schema/sessions";
import * as surveys from "@/db/schema/surveys";
import * as users from "@/db/schema/users";
import * as verificationTokens from "@/db/schema/verificationTokens";
import { IS_PRODUCTION } from "@/util/environment/constants";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const runtimeConfig = useRuntimeConfig();

const client = postgres(runtimeConfig.database.url);
export const db = drizzle(client, {
  logger: IS_PRODUCTION ? undefined : new DrizzleLogger(),
  schema: {
    ...accounts,
    ...authenticators,
    ...posts,
    ...rooms,
    ...sessions,
    ...surveys,
    ...users,
    ...verificationTokens,
  },
});

await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER_PATH });
