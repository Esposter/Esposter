import type { Session } from "@@/server/models/auth/Session";
import type { Context } from "@@/server/trpc/context";
import type { User } from "@esposter/db-schema";
import type * as DrizzleKit from "drizzle-kit/api";

import { dayjs } from "#shared/services/dayjs";
import { useContainerClientMock } from "@@/server/composables/azure/useContainerClient.test";
import { useTableClientMock } from "@@/server/composables/azure/useTableClient.test";
import { PGlite } from "@electric-sql/pglite";
import { messageSchema, schema, users } from "@esposter/db-schema";
import { sql } from "drizzle-orm";
import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { IncomingMessage, ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { Socket } from "node:net";
import { describe, vi } from "vitest";
// https://github.com/drizzle-team/drizzle-orm/issues/2853
const require = createRequire(import.meta.url);
const { generateDrizzleJson, generateMigration } = require("drizzle-kit/api") as typeof DrizzleKit;

const mocks = vi.hoisted(() => {
  const createdAt = new Date();
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
      return { session, user };
    }),
  };
});

vi.mock(import("@@/server/auth") as unknown as Promise<{ auth: { api: { getSession: () => Session } } }>, () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

vi.mock(import("@@/server/composables/azure/useContainerClient"), () => ({
  useContainerClient: useContainerClientMock,
}));

vi.mock(import("@@/server/composables/azure/useTableClient"), () => ({
  useTableClient: useTableClientMock,
}));

export const mockSessionOnce = async (db: Context["db"], mockUser?: Session["user"]) => {
  const name = "name";
  const createdAt = new Date();
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
  const session = {
    session: createSession(user.id),
    user: { ...user, email: user.email ?? "", emailVerified: user.emailVerified ?? false },
  };
  mocks.getSession.mockImplementationOnce(() => session);
  return session;
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
// In-memory pglite db supports the same API as a mock for the postgresjs db
const createMockDb = async () => {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await createSchema(db);
  await pushSchema(db);
  await db.insert(users).values(mocks.getSession().user);
  return db as unknown as Context["db"];
};

const createSchema = async (db: PgliteDatabase<typeof schema>) => {
  await db.execute(sql.raw(`CREATE SCHEMA "${messageSchema.schemaName}"`));
};

const pushSchema = async (db: PgliteDatabase<typeof schema>) => {
  const previousJson = generateDrizzleJson({});
  const currentJson = generateDrizzleJson(schema, previousJson.id);
  const statements = await generateMigration(previousJson, currentJson);
  for (const statement of statements) await db.execute(statement);
};

describe.todo("context");
