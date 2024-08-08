import type { Adapter } from "@auth/core/adapters";

import { db } from "@/db";
import { accounts } from "@/db/schema/accounts";
import { sessions } from "@/db/schema/sessions";
import { users } from "@/db/schema/users";
import { verificationTokens } from "@/db/schema/verificationTokens";
import { DatabaseEntityType } from "@/models/shared/entity/DatabaseEntityType";
import { omit } from "@/util/object/omit";
import { NotFoundError, NotInitializedError } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const DrizzleAdapter: Adapter = {
  createSession: async (input) => (await db.insert(sessions).values(input).returning())[0],
  createUser: async (input) =>
    (
      await db
        .insert(users)
        .values({ ...input, id: crypto.randomUUID() })
        .returning()
    )[0],
  createVerificationToken: async (token) => (await db.insert(verificationTokens).values(token).returning())[0],
  deleteSession: async (sessionToken) =>
    (await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken)).returning())[0],
  deleteUser: async (id) => (await db.delete(users).where(eq(users.id, id)).returning())[0],
  getSessionAndUser: async (sessionToken) =>
    (
      await db
        .select({
          session: sessions,
          user: users,
        })
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .innerJoin(users, eq(users.id, sessions.userId))
    )[0],
  getUser: async (id) => (await db.select().from(users).where(eq(users.id, id)))[0],
  getUserByAccount: async (account) => {
    const dbAccount = (
      await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.providerAccountId, account.providerAccountId), eq(accounts.provider, account.provider)))
        .leftJoin(users, eq(accounts.userId, users.id))
    ).find(Boolean);
    return dbAccount?.User ?? null;
  },
  getUserByEmail: async (email) => (await db.select().from(users).where(eq(users.email, email)))[0],
  linkAccount: async (rawAccount) => {
    const { accessToken, expiresAt, idToken, refreshToken, scope, sessionState, tokenType, ...rest } = omit(
      (await db.insert(accounts).values(rawAccount).returning())[0],
      ["createdAt", "updatedAt", "deletedAt"],
    );
    // Drizzle will return `null` for fields that are not defined.
    // However, the return type is expecting `undefined`.
    return {
      ...rest,
      access_token: accessToken ?? undefined,
      expires_at: expiresAt ?? undefined,
      id_token: idToken ?? undefined,
      refresh_token: refreshToken ?? undefined,
      scope: scope ?? undefined,
      session_state: sessionState ?? undefined,
      token_type: (tokenType ?? undefined) as Lowercase<string> | undefined,
    };
  },
  unlinkAccount: async (account) => {
    const { provider, providerAccountId, type, userId } = (
      await db
        .delete(accounts)
        .where(and(eq(accounts.providerAccountId, account.providerAccountId), eq(accounts.provider, account.provider)))
        .returning()
    )[0];
    return { provider, providerAccountId, type, userId };
  },
  updateSession: async (input) =>
    (await db.update(sessions).set(input).where(eq(sessions.sessionToken, input.sessionToken)).returning())[0],
  updateUser: async (input) => {
    if (!input.id) throw new NotInitializedError("User id");
    return (await db.update(users).set(input).where(eq(users.id, input.id)).returning())[0];
  },
  useVerificationToken: async (params) => {
    try {
      return (
        await db
          .delete(verificationTokens)
          .where(and(eq(verificationTokens.identifier, params.identifier), eq(verificationTokens.token, params.token)))
          .returning()
      )[0];
    } catch {
      throw new NotFoundError(DatabaseEntityType.VerificationToken, `id: ${params.identifier}, token: ${params.token}`);
    }
  },
};
