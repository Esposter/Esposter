import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";
import type { Session, User } from "better-auth";

import { createMockDb as baseCreateMockDb } from "@esposter/db-mock";
import { sessions, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const createdAt = new Date();
  const user: User = {
    createdAt,
    email: "",
    emailVerified: true,
    id: crypto.randomUUID(),
    image: null,
    name: "name",
    updatedAt: createdAt,
  };
  // How fabricated sessions become rows, registered by `createMockContext`. It holds the database's own
  // `insert`, bound before any test can spy on it, because a suite stubbing `db.insert` to make application code
  // Fail must not also break the harness's bookkeeping. A suite with no database of its own — an app-side store
  // Or composable test — leaves it unset and gets sessions that exist only as objects, which is all it reads
  const state: { insert?: Context["db"]["insert"] } = {};
  return {
    // Async like the real thing, and awaited by both its callers, which is what lets every session a request is
    // Handed be a row as well as an object — `pushSubscriptions.sessionId` references one. A fresh session per
    // Call is deliberate: a suite driving two requests is driving two devices, and several rely on that
    getSession: vi.fn<() => Promise<GetSessionPayload>>(async () => {
      const getSessionPayload = { session: createMockSession(user.id), user } as const satisfies GetSessionPayload;
      await insertMockSession(getSessionPayload);
      return getSessionPayload;
    }),
    // The session-management endpoints read the session table directly but revoke through better-auth, so its
    // Two revoke methods are stubbed here alongside getSession
    revokeOtherSessions: vi.fn<(input: { headers: Headers }) => Promise<void>>(),
    revokeSession: vi.fn<(input: { body: { token: string }; headers: Headers }) => Promise<void>>(),
    state,
    user,
  };
});

vi.mock(
  import("@@/server/auth") as unknown as Promise<{
    auth: {
      api: {
        getSession: () => Promise<GetSessionPayload>;
        revokeOtherSessions: (input: { headers: Headers }) => Promise<void>;
        revokeSession: (input: { body: { token: string }; headers: Headers }) => Promise<void>;
      };
    };
  }>,
  () => ({
    auth: {
      api: {
        getSession: mocks.getSession,
        revokeOtherSessions: mocks.revokeOtherSessions,
        revokeSession: mocks.revokeSession,
      },
    },
  }),
);

// The identity every test reads to learn who it is acting as. One session for the whole run, unlike the ones a
// Request is handed, so a test comparing what it read against what it passed is comparing the same device
const defaultGetSessionPayload: GetSessionPayload = {
  get session() {
    defaultSession ??= createMockSession(mocks.user.id);
    return defaultSession;
  },
  user: mocks.user,
};
let defaultSession: Session | undefined;

const insertMockSession = async ({ session, user }: GetSessionPayload) => {
  if (!mocks.state.insert) return;
  await mocks.state.insert(sessions).values({
    expiresAt: session.expiresAt,
    id: session.id,
    token: session.token,
    updatedAt: session.updatedAt,
    userId: user.id,
  });
};

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
  mocks.getSession.mockResolvedValueOnce(getSessionPayload);
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
  mocks.getSession.mockResolvedValueOnce(getSessionPayload);
};

// `better-auth` answers null when no session exists, which is what an unauthenticated request looks like
export const mockNoSessionOnce = () => {
  mocks.getSession.mockResolvedValueOnce(null as unknown as GetSessionPayload);
};

// Spends the queued session without a request to spend it on, so the next real request runs as the default
// Identity again. Reading who you are is `getMockSession`, which consumes nothing
export const consumeMockSessionOnce = () => mocks.getSession();

export const getMockSession = () => defaultGetSessionPayload;

export const getMockRevokeSession = () => mocks.revokeSession;

export const getMockRevokeOtherSessions = () => mocks.revokeOtherSessions;

export const createMockSession = (userId: string): Session => {
  const createdAt = new Date();
  return {
    createdAt,
    expiresAt: new Date(createdAt.getTime() + Temporal.Duration.from({ days: 1 }).total("milliseconds")),
    id: crypto.randomUUID(),
    // Unique like the real thing — `sessions.token` is unique, and every session fabricated here becomes a row
    token: crypto.randomUUID(),
    updatedAt: createdAt,
    userId,
  };
};

export const createMockContext = async (): Promise<Context> => {
  const request = new IncomingMessage(new Socket());
  request.headers = {
    "x-forwarded-for": "::1",
  };
  return {
    db: await createMockDb(),
    headers: new Headers(Object.entries(request.headers as Record<string, string>)),
    req: request,
    res: new ServerResponse(request),
  };
};

const createMockDb = async () => {
  const db = (await baseCreateMockDb()) as Context["db"];
  mocks.state.insert = db.insert.bind(db);
  await db.insert(users).values({ ...mocks.user, image: mocks.user.image ?? "" });
  await insertMockSession(getMockSession());
  return db;
};

describe.todo("context");
