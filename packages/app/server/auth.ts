import { db } from "@@/server/db";
import { schema } from "@@/server/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const runtimeConfig = useRuntimeConfig();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  socialProviders: {
    facebook: {
      clientId: runtimeConfig.public.facebook.clientId,
      clientSecret: runtimeConfig.facebook.clientSecret,
    },
    github: {
      clientId: runtimeConfig.github.clientId,
      clientSecret: runtimeConfig.github.clientSecret,
    },
    google: {
      clientId: runtimeConfig.google.clientId,
      clientSecret: runtimeConfig.google.clientSecret,
    },
  },
});
