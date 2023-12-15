import { db } from "@/db";
import { accounts } from "@/db/schema/accounts";
import { sessions } from "@/db/schema/sessions";
import { users } from "@/db/schema/users";
import { verificationTokens } from "@/db/schema/verificationTokens";
import { type Adapter } from "@auth/core/adapters";
import { and, eq } from "drizzle-orm";

export const DrizzleAdapter: Adapter = {
  createUser: async (input) =>
    (
      await db
        .insert(users)
        .values({ ...input, id: crypto.randomUUID() })
        .returning()
    )[0],
  getUser: async (id) => (await db.select().from(users).where(eq(users.id, id)))[0],
  getUserByEmail: async (email) => (await db.select().from(users).where(eq(users.email, email)))[0],
  createSession: async (input) => (await db.insert(sessions).values(input).returning())[0],
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
  updateUser: async (input) => {
    if (!input.id) throw new Error("No user id");
    return (await db.update(users).set(input).where(eq(users.id, input.id)).returning())[0];
  },
  updateSession: async (input) =>
    (await db.update(sessions).set(input).where(eq(sessions.sessionToken, input.sessionToken)).returning())[0],
  linkAccount: async (rawAccount) => {
    const {
      idToken,
      refreshToken,
      accessToken,
      scope,
      tokenType,
      sessionState,
      expiresAt,
      createdAt,
      updatedAt,
      deletedAt,
      ...rest
    } = (await db.insert(accounts).values(rawAccount).returning())[0];
    // Drizzle will return `null` for fields that are not defined.
    // However, the return type is expecting `undefined`.
    return {
      ...rest,
      id_token: idToken ?? undefined,
      refresh_token: refreshToken ?? undefined,
      access_token: accessToken ?? undefined,
      scope: scope ?? undefined,
      token_type: tokenType ?? undefined,
      session_state: sessionState ?? undefined,
      expires_at: expiresAt ?? undefined,
    };
  },
  getUserByAccount: async (account) => {
    const dbAccount = (
      await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.providerAccountId, account.providerAccountId), eq(accounts.provider, account.provider)))
        .leftJoin(users, eq(accounts.userId, users.id))
    )[0];
    if (!dbAccount) return null;
    return dbAccount.User;
  },
  deleteSession: async (sessionToken) =>
    (await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken)).returning())[0],
  createVerificationToken: async (token) => (await db.insert(verificationTokens).values(token).returning())[0],
  useVerificationToken: async (params) => {
    try {
      return (
        await db
          .delete(verificationTokens)
          .where(and(eq(verificationTokens.identifier, params.identifier), eq(verificationTokens.token, params.token)))
          .returning()
      )[0];
    } catch (err) {
      throw new Error("No verification token found");
    }
  },
  deleteUser: async (id) => (await db.delete(users).where(eq(users.id, id)).returning())[0],
  unlinkAccount: async (account) => {
    const { type, provider, providerAccountId, userId } = (
      await db
        .delete(accounts)
        .where(and(eq(accounts.providerAccountId, account.providerAccountId), eq(accounts.provider, account.provider)))
        .returning()
    )[0];
    return { provider, type, providerAccountId, userId };
  },
};
