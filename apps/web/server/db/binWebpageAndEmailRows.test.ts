import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";

import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { resourcesInResource, ResourceType, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The cutover's custom migration, run over the rows it names. The mock database loads a snapshot of the schema rather
// Than running migrations, so the migration's own SQL is what this test applies
const MIGRATION_PATH = new URL("migrations/20261024050536_bin_webpage_and_email_rows/migration.sql", import.meta.url);

describe("bin webpage and email rows migration", () => {
  let mockContext: Context;
  let ctx: AuthedContext;

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockContext.db.delete(resourcesInResource);
    await mockContext.db.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  test("a published webpage is removed by the cutover", async () => {
    expect.hasAssertions();

    const insertResource = async (type: ResourceType) =>
      takeOne(
        await mockContext.db
          .insert(resourcesInResource)
          .values({ name: type, type, userId: ctx.getSessionPayload.user.id })
          .returning(),
      );
    const webpage = await insertResource(ResourceType.Webpage);
    const email = await insertResource(ResourceType.Email);
    const sheet = await insertResource(ResourceType.Sheet);

    await mockContext.db.execute(sql.raw(await readFile(MIGRATION_PATH, "utf8")));

    const rows = await mockContext.db.select().from(resourcesInResource);
    const deletedAtMap = new Map(rows.map(({ deletedAt, id }) => [id, deletedAt]));

    expect(deletedAtMap.get(webpage.id)).toStrictEqual(new Date(0));
    expect(deletedAtMap.get(email.id)).toStrictEqual(new Date(0));
    expect(deletedAtMap.get(sheet.id)).toBeNull();
  });
});
