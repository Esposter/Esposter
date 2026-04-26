import { db } from "@@/server/db";
import { standardRateLimiter } from "@@/server/services/rateLimiter/standardRateLimiter";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { schema, selectUserSchema } from "@esposter/db-schema";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  rateLimit: {
    max: standardRateLimiter.points,
    window: standardRateLimiter.duration,
  },
  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      biography: {
        required: false,
        type: "string",
        validator: {
          input: selectUserSchema.shape.biography,
        },
      },
    },
  },
});
