import { DrizzleLogger } from "@/server/db/logger";
import * as accounts from "@/shared/db/schema/accounts";
import * as authenticators from "@/shared/db/schema/authenticators";
import * as posts from "@/shared/db/schema/posts";
import * as rooms from "@/shared/db/schema/rooms";
import * as sessions from "@/shared/db/schema/sessions";
import * as surveys from "@/shared/db/schema/surveys";
import * as users from "@/shared/db/schema/users";
import * as verificationTokens from "@/shared/db/schema/verificationTokens";
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
