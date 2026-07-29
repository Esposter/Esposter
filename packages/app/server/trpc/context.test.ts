import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";
import type { Session, User } from "better-auth";

import { dayjs } from "#shared/services/dayjs";
import { createMockDb as baseCreateMockDb } from "@esposter/db-mock";
import { users } from "@esposter/db-schema";
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
  return {
    getSession: vi.fn<() => GetSessionPayload>(() => {
      const session = createSession(user.id);
      return { session, user };
    }),
  };
});

vi.mock(
  import("@@/server/auth") as unknown as Promise<{ auth: { api: { getSession: () => GetSessionPayload } } }>,
  () => ({
    auth: {
      api: {
        getSession: mocks.getSession,
      },
    },
  }),
);

// The Azure client mocks are registered in `shared/test/setup.ts`, not here — only the session mock above needs
// This module's state, and a registration written here never reaches a test file's own direct import.

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
  const getSessionPayload = { session: createSession(user.id), user } as const satisfies GetSessionPayload;
  mocks.getSession.mockReturnValueOnce(getSessionPayload);
  return getSessionPayload;
};

export const replayMockSession = (getSessionPayload: GetSessionPayload) => {
  mocks.getSession.mockReturnValueOnce(getSessionPayload);
};

// Simulates an unauthenticated request for the next call — better-auth returns null when no session exists
export const mockNoSessionOnce = () => {
  mocks.getSession.mockReturnValueOnce(null as unknown as GetSessionPayload);
};

export const getMockSession = () => mocks.getSession();

const createSession = (userId: string): Session => {
  const createdAt = new Date();
  return {
    createdAt,
    expiresAt: new Date(createdAt.getTime() + dayjs.duration(1, "day").asMilliseconds()),
    id: crypto.randomUUID(),
    token: "",
    updatedAt: createdAt,
    userId,
  };
};

export const createMockContext = async (): Promise<Context> => {
  const req = new IncomingMessage(new Socket());
  req.headers = {
    "x-forwarded-for": "::1",
  };
  return {
    db: await createMockDb(),
    headers: new Headers(Object.entries(req.headers as Record<string, string>)),
    req,
    res: new ServerResponse(req),
  };
};

const createMockDb = async () => {
  const db = await baseCreateMockDb();
  const { user } = mocks.getSession();
  await db.insert(users).values({ ...user, image: user.image ?? "" });
  return db as Context["db"];
};

describe.todo("context");
