import { DrizzleLogger } from "@/server/db/logger";
import * as accounts from "@/server/db/schema/accounts";
import * as authenticators from "@/server/db/schema/authenticators";
import * as posts from "@/server/db/schema/posts";
import * as rooms from "@/server/db/schema/rooms";
import * as sessions from "@/server/db/schema/sessions";
import * as surveys from "@/server/db/schema/surveys";
import * as users from "@/server/db/schema/users";
import * as verificationTokens from "@/server/db/schema/verificationTokens";
import { IS_PRODUCTION } from "@/shared/util/environment/constants";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const useDb = () => {
  const runtimeConfig = useRuntimeConfig();
  const client = postgres(runtimeConfig.database.url);
  return drizzle(client, {
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
};
