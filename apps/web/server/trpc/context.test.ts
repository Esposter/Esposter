import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";
import type { Session, User } from "better-auth";

import { authMocks, createMockSession, insertMockSession } from "@@/server/auth.test";
import { getRequestHeaders } from "@@/server/services/request/getRequestHeaders";
import { createMockDb as baseCreateMockDb } from "@esposter/db-mock";
import { users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
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
        .insert(users)
        .values({
          createdAt,
          email: crypto.randomUUID(),
          emailVerified: true,
          id: crypto.randomUUID(),
          image: crypto.randomUUID(),
          name: crypto.randomUUID(),
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

export const createMockContext = async (): Promise<Context> => {
  const request = new IncomingMessage(new Socket());
  request.headers = {
    "x-forwarded-for": "::1",
  };
  return {
    db: await createMockDb(),
    headers: getRequestHeaders(request),
    req: request,
    res: new ServerResponse(request),
  };
};

const createMockDb = async () => {
  const db = await baseCreateMockDb();
  authMocks.state.insert = db.insert.bind(db);
  await db.insert(users).values({ ...authMocks.user, image: authMocks.user.image ?? "" });
  await insertMockSession(getMockSession());
  return db;
};

describe.todo("context");
