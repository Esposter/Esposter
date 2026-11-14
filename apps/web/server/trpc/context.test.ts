import type { Context } from "#server/trpc/context";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Session, User } from "better-auth";

import { authMocks, createMockSession, insertMockSession } from "#server/auth.test";
import { createMockDb as baseCreateMockDb, emptyD1Database } from "@esposter/db-mock";
import { usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { describe } from "vitest";

// The identity every test reads to learn who it is acting as. One session for the whole run, unlike the ones a
// Request is handed, so a test comparing what it read against what it passed is comparing the same device
const defaultGetSessionPayload: GetSessionPayload = {
  get session() {
    defaultSession ??= createMockSession(authMocks.user.id);
    return defaultSession;
  },
  user: authMocks.user,
};
let defaultSession: Session | undefined;

export const mockSessionOnce = async (db: Context["db"], mockUser?: User) => {
  const createdAt = new Date();
  const user =
    mockUser ??
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
  const getSessionPayload = { session: createMockSession(user.id), user } as const satisfies GetSessionPayload;
  await insertMockSession(getSessionPayload);
  authMocks.getSession.mockResolvedValueOnce(getSessionPayload);
  return getSessionPayload;
};

// A second user for the test to act on rather than act as — the session `mockSessionOnce` queues for it is
// Consumed here, so the caller stays on the session it already had
export const createMockUser = async (db: Context["db"]) => {
  const { user } = await mockSessionOnce(db);
  await consumeMockSessionOnce();
  return user;
};

export const replayMockSession = (getSessionPayload: GetSessionPayload) => {
  authMocks.getSession.mockResolvedValueOnce(getSessionPayload);
};

// `better-auth` answers null when no session exists, which is what an unauthenticated request looks like
export const mockNoSessionOnce = () => {
  authMocks.getSession.mockResolvedValueOnce(null);
};

// Spends the queued session without a request to spend it on, so the next real request runs as the default
// Identity again. Reading who you are is `getMockSession`, which consumes nothing
export const consumeMockSessionOnce = () => authMocks.getSession();

export const getMockSession = () => defaultGetSessionPayload;

export const getMockRevokeSession = () => authMocks.revokeSession;

export const getMockRevokeOtherSessions = () => authMocks.revokeOtherSessions;

export const getMockCreateApiKey = () => authMocks.createApiKey;

// Empties the streams database, where the tables a message or a room write lands, and leaves the core rows the context was
// seeded with in place
export const clearStreamTables = async () => emptyD1Database((await baseCreateMockDb()).streamsDb);

export const createMockContext = async (): Promise<Context> => ({
  db: await createMockDb(),
  headers: new Headers(),
  ipAddress: "::1",
  responseHeaders: new Headers(),
});

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
