import { NuxtAuthHandler } from "#auth";
import { prisma } from "@/prisma";
import { LOGIN_PATH } from "@/util/constants.common";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { GithubProfile } from "next-auth/providers/github";
import NextGithubProvider from "next-auth/providers/github";

// @NOTE: Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
// @ts-ignore
const GithubProvider = NextGithubProvider.default as typeof NextGithubProvider<GithubProfile>;

export default NuxtAuthHandler({
  // Secret needed to run nuxt-auth in production mode (used to encrypt data)
  secret: process.env.NUXT_AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: LOGIN_PATH,
  },
});
