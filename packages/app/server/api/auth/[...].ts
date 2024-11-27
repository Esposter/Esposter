import type { AuthConfig } from "@auth/core";
import type { AdapterUser } from "@auth/core/adapters";
import type { Session } from "@auth/core/types";

import { NuxtAuthHandler } from "#auth";
import { accounts } from "#shared/db/schema/accounts";
import { authenticators } from "#shared/db/schema/authenticators";
import { sessions } from "#shared/db/schema/sessions";
import { users } from "#shared/db/schema/users";
import { verificationTokens } from "#shared/db/schema/verificationTokens";
import { RoutePath } from "#shared/models/router/RoutePath";
import { useDb } from "@@/server/util/useDb";
import FacebookProvider from "@auth/core/providers/facebook";
import GithubProvider from "@auth/core/providers/github";
import GoogleProvider from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

const db = useDb();
const runtimeConfig = useRuntimeConfig();

export const authOptions: AuthConfig = {
  // @TODO
  // @ts-expect-error mismatching @auth/core versions we ignore for now
  adapter: DrizzleAdapter(db, {
    accountsTable: accounts,
    authenticatorsTable: authenticators,
    sessionsTable: sessions,
    usersTable: users,
    verificationTokensTable: verificationTokens,
  }),
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
