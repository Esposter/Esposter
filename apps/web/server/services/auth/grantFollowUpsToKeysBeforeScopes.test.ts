import type { Database } from "@esposter/db-schema";
import type { ApiKeyPermissions } from "#shared/models/auth/ApiKeyPermissions";

import { grantFollowUpsToKeysBeforeScopes } from "#server/services/auth/grantFollowUpsToKeysBeforeScopes";
import { McpScope } from "#shared/models/auth/McpScope";
import { createMockDb } from "@esposter/db-mock";
import { apiKeysInAuth, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(grantFollowUpsToKeysBeforeScopes, () => {
  const createdAt = new Date(0);
  const email = "email";
  const key = "key";
  const name = "name";
  const userId = crypto.randomUUID();
  // A key as better-auth stores it: its permissions are a JSON string, and null for a key made before scopes existed
  const createApiKey = async (db: Database, permissions: null | string) => {
    const id = crypto.randomUUID();
    await db.insert(apiKeysInAuth).values({ id, key, permissions, referenceId: userId });
    return id;
  };
  const readPermissions = async (db: Database, id: string) =>
    takeOne(
      await db.select({ permissions: apiKeysInAuth.permissions }).from(apiKeysInAuth).where(eq(apiKeysInAuth.id, id)),
      0,
    ).permissions;

  test("A key created before scopes can run the follow-ups", async () => {
    expect.hasAssertions();

    const db = await createMockDb();
    await db
      .insert(usersInAuth)
      .values({ biography: "", createdAt, email, emailVerified: true, id: userId, name, updatedAt: createdAt });
    const id = await createApiKey(db, null);

    await grantFollowUpsToKeysBeforeScopes(db);

    expect(await readPermissions(db, id)).toBe(
      JSON.stringify({ mcp: [McpScope.FollowUps] } satisfies ApiKeyPermissions),
    );
  });

  test("A key that already holds scopes keeps them", async () => {
    expect.hasAssertions();

    const db = await createMockDb();
    await db
      .insert(usersInAuth)
      .values({ biography: "", createdAt, email, emailVerified: true, id: userId, name, updatedAt: createdAt });
    const permissions = JSON.stringify({ mcp: [McpScope.Resources] } satisfies ApiKeyPermissions);
    const id = await createApiKey(db, permissions);

    await grantFollowUpsToKeysBeforeScopes(db);

    expect(await readPermissions(db, id)).toBe(permissions);
  });
});
