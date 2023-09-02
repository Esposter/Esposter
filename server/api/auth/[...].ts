import { NuxtAuthHandler } from "#auth";
import { db } from "@/db";
import { RoutePath } from "@/models/router/RoutePath";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { FacebookProfile } from "next-auth/providers/facebook";
import NextFacebookProvider from "next-auth/providers/facebook";
import type { GithubProfile } from "next-auth/providers/github";
import NextGithubProvider from "next-auth/providers/github";
import type { GoogleProfile } from "next-auth/providers/google";
import NextGoogleProvider from "next-auth/providers/google";

// @NOTE: Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
// @ts-expect-error
const FacebookProvider = NextFacebookProvider.default as typeof NextFacebookProvider<FacebookProfile>;
// @ts-expect-error
const GithubProvider = NextGithubProvider.default as typeof NextGithubProvider<GithubProfile>;
// @ts-expect-error
const GoogleProvider = NextGoogleProvider.default as typeof NextGoogleProvider<GoogleProfile>;

export default NuxtAuthHandler({
  // Secret needed to run nuxt-auth in production mode (used to encrypt data)
  secret: process.env.NUXT_AUTH_SECRET,
  adapter: DrizzleAdapter(db),
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: RoutePath.Login,
  },
});
