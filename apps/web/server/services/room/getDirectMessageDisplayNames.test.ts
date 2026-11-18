import { getDirectMessageDisplayNames } from "#server/services/room/getDirectMessageDisplayNames";
import { createMockContext, createMockUser } from "#server/trpc/context.test";
import { roomsInMessage, RoomType, usersToRoomsInMessage } from "@esposter/db-schema";
import { sql } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// The sidebar reads the participant names of every direct message it lists, so the query starts from the viewer's rooms
// Through an index, rather than scanning every direct message or every membership
describe(getDirectMessageDisplayNames, () => {
  test("the participant names are searched by the viewer's rooms and their memberships, not scanned", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const viewer = await createMockUser(context.db);
    const other = await createMockUser(context.db);
    const roomId = v7();
    await context.db
      .insert(roomsInMessage)
      .values({ id: roomId, name: "", participantKey: roomId, type: RoomType.DirectMessage, userId: viewer.id });
    await context.db.insert(usersToRoomsInMessage).values([
      { roomId, userId: viewer.id },
      { roomId, userId: other.id },
    ]);
    const directMessageDisplayNames = await getDirectMessageDisplayNames(context.db, viewer.id);
    const query = context.db
      .select({ displayName: directMessageDisplayNames.displayName, roomId: directMessageDisplayNames.roomId })
      .from(directMessageDisplayNames);
    const plan = await context.db.all(sql`EXPLAIN QUERY PLAN ${query.getSQL()}`);
    const details = plan.map((row) => (row as { detail: string }).detail);
    console.log(`PLAN ${JSON.stringify(details)}`);

    expect(details.filter((detail) => /^SCAN (?:message_rooms|participantMembership)\b/u.test(detail))).toStrictEqual(
      [],
    );
  });

  // A direct message the viewer is alone in has no other participant to name, so its name is empty, but it keeps a row keyed
  // By its own room, rather than sharing a null room's row with every other such direct message
  test("a direct message with no other participant keeps its own row, not a null room's", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const viewer = await createMockUser(context.db);
    const other = await createMockUser(context.db);
    const withOtherId = v7();
    const aloneId = v7();
    await context.db.insert(roomsInMessage).values([
      { id: withOtherId, name: "", participantKey: withOtherId, type: RoomType.DirectMessage, userId: viewer.id },
      { id: aloneId, name: "", participantKey: aloneId, type: RoomType.DirectMessage, userId: viewer.id },
    ]);
    await context.db.insert(usersToRoomsInMessage).values([
      { roomId: withOtherId, userId: viewer.id },
      { roomId: withOtherId, userId: other.id },
      { roomId: aloneId, userId: viewer.id },
    ]);
    const directMessageDisplayNames = await getDirectMessageDisplayNames(context.db, viewer.id);
    const rows = await context.db.select({ roomId: directMessageDisplayNames.roomId }).from(directMessageDisplayNames);

    expect(rows.map(({ roomId }) => roomId).toSorted()).toStrictEqual([aloneId, withOtherId].toSorted());
  });
});
