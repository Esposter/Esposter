import { createMockDb } from "@esposter/db-mock";
import { resourcesInResource, ResourceType, usersInAuth } from "@esposter/db-schema";
import { sql } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("binWebpageAndEmailRows", () => {
  const userId = crypto.randomUUID();
  const migration = readFileSync(
    join(import.meta.dirname, "migrations/20261024050536_bin_webpage_and_email_rows/migration.sql"),
    "utf8",
  );
  const createdAt = new Date(0);
  const recycledAt = new Date(Date.UTC(2026, 9, 20));

  // One resource of each kind the migration is about, the webpage already in the recycle bin, and a note it leaves alone
  const createMigratedDatabase = async () => {
    const db = await createMockDb();
    await db
      .insert(usersInAuth)
      .values({
        biography: "",
        createdAt,
        email: "email",
        emailVerified: true,
        id: userId,
        name: "name",
        updatedAt: createdAt,
      });
    await db.insert(resourcesInResource).values([
      { name: "published", type: ResourceType.Webpage, userId },
      { deletedAt: recycledAt, name: "recycled", type: ResourceType.Webpage, userId },
      { name: "email", type: ResourceType.Email, userId },
      { name: "note", type: ResourceType.Note, userId },
    ]);
    await db.execute(sql.raw(migration));
    return db;
  };

  test("a published webpage is removed by the cutover", async () => {
    expect.hasAssertions();

    const db = await createMigratedDatabase();
    const rows = await db.query.resourcesInResource.findMany({ columns: { deletedAt: true, name: true, type: true } });

    expect(
      rows
        .filter(({ type }) => type === ResourceType.Webpage || type === ResourceType.Email)
        .filter(({ name }) => name !== "recycled")
        .map(({ deletedAt }) => deletedAt),
    ).toStrictEqual([createdAt, createdAt]);
  });

  test("a webpage in the recycle bin is not restored by the cutover", async () => {
    expect.hasAssertions();

    const db = await createMigratedDatabase();
    const recycled = await db.query.resourcesInResource.findFirst({
      columns: { deletedAt: true },
      where: { name: "recycled" },
    });

    expect(recycled?.deletedAt).toStrictEqual(createdAt);
  });

  test("a note is left as it was", async () => {
    expect.hasAssertions();

    const db = await createMigratedDatabase();
    const note = await db.query.resourcesInResource.findFirst({
      columns: { deletedAt: true },
      where: { name: "note" },
    });

    expect(note?.deletedAt).toBeNull();
  });
});
