import type { Session } from "@@/server/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { dayjs } from "#shared/services/dayjs";
import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@@/server/db/schema";
import { NIL } from "@esposter/shared";
import { drizzle } from "drizzle-orm/postgres-js";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, vi } from "vitest";

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
          user: {
            createdAt,
            email: "",
            emailVerified: true,
            id: NIL,
            name: "",
            updatedAt: createdAt,
          },
        };
      },
    },
  },
}));

export const createMockContext = (): Context => {
  const req = new IncomingMessage(new Socket());
  req.headers = {
    "x-forwarded-for": "::1",
  };
  return {
    // @ts-expect-error @TODO: drizzle type issue
    db: drizzle.mock({ logger: new DrizzleLogger(), schema }),
    req,
    res: new ServerResponse(req),
  };
};

describe.todo("context");
