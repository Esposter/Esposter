import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { auth as realAuth } from "@@/server/auth";
import type { Context } from "@@/server/trpc/context";
import type { Session, User } from "better-auth";

import { sessions } from "@esposter/db-schema";
import { describe, vi } from "vitest";

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
// How fabricated sessions become rows, registered by `createMockContext`. It holds the database's own `insert`,
// Bound before any test can spy on it, because a suite stubbing `db.insert` to make application code fail must
// Not also break the harness's bookkeeping. A suite with no database of its own — an app-side store or composable
// Test — leaves it unset and gets sessions that exist only as objects, which is all it reads
const state: { insert?: Context["db"]["insert"] } = {};

export const insertMockSession = async ({ session, user: sessionUser }: GetSessionPayload) => {
  if (!state.insert) return;
  await state.insert(sessions).values({
    expiresAt: session.expiresAt,
    id: session.id,
    token: session.token,
    updatedAt: session.updatedAt,
    userId: sessionUser.id,
  });
};

export const authMocks = {
  // Async like the real thing, and awaited by both its callers, which is what lets every session a request is
  // Handed be a row as well as an object — `pushSubscriptions.sessionId` references one. A fresh session per
  // Call is deliberate: a suite driving two requests is driving two devices, and several rely on that
  getSession: vi.fn<() => Promise<GetSessionPayload | null>>(async () => {
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

// The better-auth surface the server reads — the three methods are the whole of it, so the rest of the instance
// Is uncalled. Registered over `@@/server/auth` by the vitest setup file, never by a `vi.mock` in a helper: a
// Mock is hoisted only within the file that writes it, so one written beside the session helpers reached a suite
// Only while that module loaded before the suite's router import loaded the real one
export const auth = {
  api: {
    getSession: authMocks.getSession,
    revokeOtherSessions: authMocks.revokeOtherSessions,
    revokeSession: authMocks.revokeSession,
  },
} as unknown as typeof realAuth;

describe.todo("auth");
