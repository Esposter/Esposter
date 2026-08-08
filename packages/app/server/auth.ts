import { db } from "@@/server/db";
import { standardRateLimiter } from "@@/server/services/rateLimiter/standardRateLimiter";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { schema, selectUserSchema } from "@esposter/db-schema";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  account: {
    // Every value below is also better-auth's default. They are written out because together they are the
    // Sign-in security posture — which claims count as proof that two provider accounts are the same person —
    // And a posture inherited from a library default is one nobody chose and a minor version may move
    accountLinking: {
      allowDifferentEmails: false,
      allowUnlinkingAll: false,
      // Sign-in links a second provider onto an existing user when both the incoming claim and the stored user
      // Row carry a verified email, so one person signing in with a different button stays one person
      disableImplicitLinking: false,
      enabled: true,
      // Deliberately empty: naming a provider here accepts its email claim as ownership proof without the
      // Verified-email check, so anyone able to register that address at the provider inherits the local user
      trustedProviders: [],
      // The profile is user-owned and editable in settings, so linking a provider never overwrites it
      updateUserInfoOnLink: false,
    },
  },
  database: drizzleAdapter(db, {
    camelCase: true,
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
        required: true,
        type: "string",
        validator: {
          input: selectUserSchema.shape.biography,
        },
      },
    },
  },
});
