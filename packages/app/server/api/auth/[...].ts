import type { AuthConfig } from "@auth/core";
import type { AdapterUser } from "@auth/core/adapters";
import type { Session } from "@auth/core/types";

import { NuxtAuthHandler } from "#auth";
import { RoutePath } from "@/models/router/RoutePath";
import { DrizzleAdapter } from "@/server/auth/DrizzleAdapter";
import FacebookProvider from "@auth/core/providers/facebook";
import GithubProvider from "@auth/core/providers/github";
import GoogleProvider from "@auth/core/providers/google";

const runtimeConfig = useRuntimeConfig();

export const authOptions: AuthConfig = {
  adapter: DrizzleAdapter,
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
  providers: [
    FacebookProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: runtimeConfig.public.facebook.clientId,
      clientSecret: runtimeConfig.facebook.clientSecret,
    }),
    GithubProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: runtimeConfig.github.clientId,
      clientSecret: runtimeConfig.github.clientSecret,
    }),
    GoogleProvider({
      allowDangerousEmailAccountLinking: true,
      clientId: runtimeConfig.google.clientId,
      clientSecret: runtimeConfig.google.clientSecret,
    }),
  ],
  secret: runtimeConfig.auth.secret,
};

export default NuxtAuthHandler(authOptions, runtimeConfig);
