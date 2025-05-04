import type { User } from "#shared/db/schema/users";
import type { Session } from "@@/server/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { users } from "#shared/db/schema/users";
import { dayjs } from "#shared/services/dayjs";
import { schema } from "@@/server/db/schema";
import { PGlite } from "@electric-sql/pglite";
import { NIL } from "@esposter/shared";
import { drizzle } from "drizzle-orm/pglite";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, vi } from "vitest";

const createdAt = new Date(0);
const mockUser: User = {
  createdAt,
  deletedAt: null,
  email: "",
  emailVerified: true,
  id: NIL,
  image: null,
  name: "name",
  updatedAt: createdAt,
};

vi.mock("@@/server/auth", () => ({
  auth: {
    api: {
      getSession: (): Session => {
        const createdAt = new Date();
        return {
          session: {
            createdAt,
            expiresAt: new Date(createdAt.getTime() + dayjs.duration(1, "day").asMilliseconds()),
            id: NIL,
            token: "",
            updatedAt: createdAt,
            userId: NIL,
          },
          user: mockUser,
        };
      },
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
  const { createRequire } = await vi.importActual<typeof import("node:module")>("node:module");
  const require = createRequire(import.meta.url);
  // @TODO: https://github.com/drizzle-team/drizzle-orm/issues/2853#issuecomment-2668459509
  const { pushSchema } = require("drizzle-kit/api") as typeof import("drizzle-kit/api");
  const client = new PGlite();
  const db = drizzle(client, { schema });
  const { apply } = await pushSchema(schema, db as never);
  await apply();
  await db.insert(users).values(mockUser);
  // It is fine to use pglite here as a mock for the postgresjs db
  // as they support the same API
  return db as unknown as Context["db"];
};

describe.todo("context");
