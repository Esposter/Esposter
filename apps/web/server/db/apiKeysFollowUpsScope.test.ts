import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";

import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { McpScope } from "#shared/models/auth/McpScope";
import { apiKeysInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq, sql } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("api keys follow-ups scope migration", () => {
  // The startup migration's own SQL, run over the keys it names. The mock database loads a snapshot of the schema rather
  // Than running migrations, so the migration's SQL is what this test applies
  const MIGRATION_PATH = new URL("migrations/20261013003850_api_keys_follow_ups_scope/migration.sql", import.meta.url);

  let mockContext: Context;
  let ctx: AuthedContext;

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  afterEach(async () => {
    await mockContext.db.delete(apiKeysInAuth);
  });

  const insertKey = async (permissions: null | string) => {
    const id = crypto.randomUUID();
    await mockContext.db
      .insert(apiKeysInAuth)
      .values({
        id,
        key: crypto.randomUUID(),
        permissions,
        referenceId: ctx.getSessionPayload.user.id,
        updatedAt: new Date(0),
      });
    return id;
  };
  const readKeyPermissions = async (id: string) => {
    const key = takeOne(await mockContext.db.select().from(apiKeysInAuth).where(eq(apiKeysInAuth.id, id)));
    return key.permissions;
  };

  test("a key created before scopes can run the follow-ups", async () => {
    expect.hasAssertions();

    const id = await insertKey(null);

    await mockContext.db.execute(sql.raw(await readFile(MIGRATION_PATH, "utf8")));

    await expect(readKeyPermissions(id)).resolves.toBe(JSON.stringify({ mcp: [McpScope.FollowUps] }));
  });

  test("a key that already holds scopes keeps them", async () => {
    expect.hasAssertions();

    const permissions = JSON.stringify({ mcp: [McpScope.Resources] });
    const id = await insertKey(permissions);

    await mockContext.db.execute(sql.raw(await readFile(MIGRATION_PATH, "utf8")));

    await expect(readKeyPermissions(id)).resolves.toBe(permissions);
  });
});
