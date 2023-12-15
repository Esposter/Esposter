import { NuxtAuthHandler } from "#auth";
import { RoutePath } from "@/models/router/RoutePath";
import { DrizzleAdapter } from "@/server/auth/DrizzleAdapter";
import { type AuthConfig } from "@auth/core";
import FacebookProvider from "@auth/core/providers/facebook";
import GithubProvider from "@auth/core/providers/github";
import GoogleProvider from "@auth/core/providers/google";

const runtimeConfig = useRuntimeConfig();

export const authOptions: AuthConfig = {
  secret: runtimeConfig.auth.secret,
  adapter: DrizzleAdapter,
  providers: [
    FacebookProvider({
      clientId: runtimeConfig.public.facebook.clientId,
      clientSecret: runtimeConfig.facebook.clientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: runtimeConfig.github.clientId,
      clientSecret: runtimeConfig.github.clientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: runtimeConfig.google.clientId,
      clientSecret: runtimeConfig.google.clientSecret,
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
};

export default NuxtAuthHandler(authOptions, runtimeConfig);
