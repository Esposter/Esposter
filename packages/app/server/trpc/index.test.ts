import type { Context } from "@@/server/trpc/context";

import { DrizzleLogger } from "@@/server/db/logger";
import { schema } from "@@/server/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, expect, test } from "vitest";

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

describe("trpc", () => {
  test("stub", () => {
    expect.hasAssertions();

    expect(undefined).toBeUndefined();
  });
});
