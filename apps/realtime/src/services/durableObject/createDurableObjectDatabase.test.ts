import { createDurableObjectDatabase } from "#src/services/durableObject/createDurableObjectDatabase";
import { createMockObjectState } from "@esposter/db-mock";
import { remindersInUser } from "@esposter/db-schema";
import userMigrations from "@esposter/db-schema/objects/user/migrations/migrations";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(createDurableObjectDatabase, () => {
  // An object's table carries the version the database raises on each change, as a D1 table does: an insert starts it at
  // Zero, an update raises it, and an upsert that updates the existing row raises it too, all inside the statement itself
  test("raises a row's version on each update of an object's table, from zero on insert and through an upsert's update branch", () => {
    expect.hasAssertions();

    const database = createDurableObjectDatabase(
      createMockObjectState("user").ctx as unknown as DurableObjectState,
      userMigrations.migrations,
    );
    const reminderId = v7();
    const roomId = v7();
    const readVersion = () =>
      takeOne(
        database
          .select({ version: remindersInUser.version })
          .from(remindersInUser)
          .where(eq(remindersInUser.id, reminderId))
          .all(),
        0,
      ).version;
    database
      .insert(remindersInUser)
      .values({ id: reminderId, roomId, runAt: new Date(0), text: "created" })
      .run();
    const initialVersion = readVersion();

    database.update(remindersInUser).set({ text: "updated" }).where(eq(remindersInUser.id, reminderId)).run();
    const updatedVersion = readVersion();

    database
      .insert(remindersInUser)
      .values({ id: reminderId, roomId, runAt: new Date(0), text: "upserted" })
      .onConflictDoUpdate({ set: { text: "upserted" }, target: remindersInUser.id })
      .run();

    expect([initialVersion, updatedVersion, readVersion()]).toStrictEqual([0, 1, 2]);
  });
});
