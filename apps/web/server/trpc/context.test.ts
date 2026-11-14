import type { AuthSession } from "#server/models/auth/AuthSession";
import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { TRPCBuiltRouter, TRPCRouterRecord } from "@trpc/server";

import { authMocks, createMockSession, insertMockSession } from "#server/auth.test";
import { createCallerFactory } from "#server/trpc";
import { createMockDb as baseCreateMockDb } from "@esposter/db-mock";
import { usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { describe } from "vitest";

// The identity every test acts as unless it names another, and reads to learn who it is. One session for the whole
// Run, so a test comparing what it read against what it passed is comparing the same device
const defaultAuthSession: AuthSession = {
  get session() {
    defaultSession ??= createMockSession(authMocks.user.id);
    return defaultSession;
  },
  user: authMocks.user,
};
let defaultSession: AuthSession["session"] | undefined;

// A user of the test's own with a session row of their own: a second person for the test to act as or act on, or, given a
// User it already has, a second device of theirs
export const createMockAuthSession = async (
  db: Context["db"],
  existingUser?: AuthSession["user"],
): Promise<AuthSession> => {
  const createdAt = new Date();
  const user =
    existingUser ??
    takeOne(
      await db
        .insert(usersInAuth)
        .values({
          createdAt,
          email: v7(),
          emailVerified: true,
          id: v7(),
          image: v7(),
          name: v7(),
          updatedAt: createdAt,
        })
        .returning(),
    );
  const authSession = { session: createMockSession(user.id), user } satisfies AuthSession;
  await insertMockSession(authSession);
  return authSession;
};

// A second user for the test to act on rather than act as
export const createMockUser = async (db: Context["db"]) => (await createMockAuthSession(db)).user;

export const getMockSession = () => defaultAuthSession;

export const getMockRevokeSession = () => authMocks.revokeSession;

export const getMockRevokeOtherSessions = () => authMocks.revokeOtherSessions;

export const getMockCreateApiKey = () => authMocks.createApiKey;

// A request's context, as the default identity unless the test names another caller, and signed out for null. The
// Caller is fixed for the context's life, as one request's is, so a test acting as two people holds two contexts
export const createMockContext = async (authSession: AuthSession | null = defaultAuthSession): Promise<Context> => ({
  db: await createMockDb(),
  headers: new Headers(),
  ipAddress: "::1",
  responseHeaders: new Headers(),
  session: authSession?.session ?? null,
  user: authSession?.user ?? null,
});

// A router's caller acting as the given caller, as `createMockContext` reads it: the default identity when none is named,
// Signed out for null
export const createMockCaller = async <TRecord extends TRPCRouterRecord>(
  router: TRPCBuiltRouter<TRPCRouter["_def"]["_config"]["$types"], TRecord>,
  authSession?: AuthSession | null,
) => createCallerFactory(router)(await createMockContext(authSession));

const seedMockDb = async () => {
  const { db } = await baseCreateMockDb();
  authMocks.state.insert = db.insert.bind(db);
  await db.insert(usersInAuth).values({ ...authMocks.user, image: authMocks.user.image ?? "" });
  await insertMockSession(getMockSession());
  return db;
};

// A file's contexts share one database, so the default user and session are written once, by the first context it makes
let seededDatabase: Promise<Context["db"]> | undefined;
const createMockDb = async () => {
  seededDatabase ??= seedMockDb();
  return seededDatabase;
};

describe.todo("context");
