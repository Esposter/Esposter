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
      // Facebook only, and for a narrow reason: it verifies an address at registration but does not expose
      // `email_verified` on the Graph profile better-auth reads, so its claim arrives unverified because the
      // Field is absent rather than because the address is unproven. Without this the Link button on its row
      // Could never succeed. The cost is that a Facebook account holding an address better-auth cannot check
      // Would link into an already-verified local user — accepted, because the alternative is a provider that
      // Can sign in and never join the account it belongs to. Google and GitHub report the claim, so they earn
      // Nothing by being listed here
      trustedProviders: ["facebook"],
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
