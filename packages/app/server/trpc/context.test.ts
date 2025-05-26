import type { User } from "#shared/db/schema/users";
import type { Session } from "@@/server/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { users } from "#shared/db/schema/users";
import { dayjs } from "#shared/services/dayjs";
import { schema } from "@@/server/db/schema";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { Socket } from "node:net";
import { describe, vi } from "vitest";
const require = createRequire(import.meta.url);

const mocks = vi.hoisted(() => {
  const createdAt = new Date(0);
  const user: User = {
    createdAt,
    deletedAt: null,
    email: "",
    emailVerified: true,
    id: crypto.randomUUID(),
    image: null,
    name: "name",
    updatedAt: createdAt,
  };
  return {
    getSession: vi.fn<() => Session>(() => {
      const session = createSession(user.id);
      return {
        session,
        user,
      };
    }),
  };
});

export const mockUserOnce = async (db: Context["db"], mockUser?: User) => {
  const name = "name";
  const createdAt = new Date(0);
  const user =
    mockUser ??
    (
      await db
        .insert(users)
        .values({
          createdAt,
          email: crypto.randomUUID(),
          emailVerified: true,
          id: crypto.randomUUID(),
          name,
          updatedAt: createdAt,
        })
        .returning()
    )[0];
  mocks.getSession.mockImplementationOnce(() => ({ session: createSession(user.id), user }));
  return user;
};

export const getMockSession = () => mocks.getSession();

const createSession = (userId: string): Session["session"] => {
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

vi.mock("@@/server/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

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
  // @TODO: https://github.com/drizzle-team/drizzle-orm/issues/2853#issuecomment-2668459509
  const { pushSchema } = require("drizzle-kit/api") as typeof import("drizzle-kit/api");
  const client = new PGlite();
  const db = drizzle(client, { schema });
  const { apply } = await pushSchema(schema, db as never);
  await apply();
  await db.insert(users).values(mocks.getSession().user);
  // Use in-memory pglite db which supports the same API
  // as a mock for the postgresjs db
  return db;
};

describe.todo("context");
