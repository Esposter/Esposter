import { NuxtAuthHandler } from "#auth";
import { env as serverEnv } from "@/env.server";
import { env as sharedEnv } from "@/env.shared";
import { RoutePath } from "@/models/router/RoutePath";
import { DrizzleAdapter } from "@/server/auth/DrizzleAdapter";
import type { AuthConfig } from "@auth/core";
import type { AdapterUser } from "@auth/core/adapters";
import FacebookProvider from "@auth/core/providers/facebook";
import GithubProvider from "@auth/core/providers/github";
import GoogleProvider from "@auth/core/providers/google";
import type { Session } from "@auth/core/types";

export const authOptions: AuthConfig = {
  secret: serverEnv.AUTH_SECRET,
  adapter: DrizzleAdapter,
  providers: [
    FacebookProvider({
      clientId: sharedEnv.FACEBOOK_CLIENT_ID,
      clientSecret: serverEnv.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    session: (params) => {
      const { session, user } = params as { session: Session; user: AdapterUser };
      if ("user" in session) session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: RoutePath.Login,
  },
};

export default NuxtAuthHandler(authOptions, useRuntimeConfig());
