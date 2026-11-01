import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";

import { createMockContext, getMockSession } from "#server/trpc/context.test";
import {
  DEFAULT_EVERYONE_PERMISSIONS,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq, sql } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("everyone role backfill migration", () => {
  // The migration's own SQL, run over the rooms it names. The mock database loads a snapshot of the schema rather than
  // Running migrations, so the migration's SQL is what this test applies
  const MIGRATION_PATH = new URL("migrations/20261101093931_everyone_role_backfill/migration.sql", import.meta.url);

  let mockContext: Context;
  let ctx: AuthedContext;

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  afterEach(async () => {
    await mockContext.db.delete(roomsInMessage);
  });

  const insertServerRoom = async () =>
    takeOne(
      await mockContext.db
        .insert(roomsInMessage)
        .values({ name: "name", type: RoomType.Room, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  const insertDirectMessage = async () =>
    takeOne(
      await mockContext.db
        .insert(roomsInMessage)
        .values({
          participantKey: "participantKey",
          type: RoomType.DirectMessage,
          userId: ctx.getSessionPayload.user.id,
        })
        .returning(),
    );
  const readRoles = (roomId: string) =>
    mockContext.db.select().from(roomRolesInMessage).where(eq(roomRolesInMessage.roomId, roomId));

  test("a server room without an @everyone role gets the default one", async () => {
    expect.hasAssertions();

    const room = await insertServerRoom();

    await mockContext.db.execute(sql.raw(await readFile(MIGRATION_PATH, "utf8")));

    const roles = await readRoles(room.id);

    expect(
      roles.map(({ isEveryone, name, permissions, position }) => ({ isEveryone, name, permissions, position })),
    ).toStrictEqual([{ isEveryone: true, name: "@everyone", permissions: DEFAULT_EVERYONE_PERMISSIONS, position: 0 }]);
  });

  test("a server room that already has an @everyone role keeps it", async () => {
    expect.hasAssertions();

    const room = await insertServerRoom();
    await mockContext.db
      .insert(roomRolesInMessage)
      .values({ isEveryone: true, name: "@everyone", permissions: RoomPermission.ReadMessages, roomId: room.id });
    const rolesBefore = await readRoles(room.id);

    await mockContext.db.execute(sql.raw(await readFile(MIGRATION_PATH, "utf8")));

    await expect(readRoles(room.id)).resolves.toStrictEqual(rolesBefore);
  });

  test("a direct message gets no role, since its send gate never reads one", async () => {
    expect.hasAssertions();

    const room = await insertDirectMessage();

    await mockContext.db.execute(sql.raw(await readFile(MIGRATION_PATH, "utf8")));

    await expect(readRoles(room.id)).resolves.toStrictEqual([]);
  });
});
