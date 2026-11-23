import { getDirectMessageDisplayNames } from "#server/services/room/getDirectMessageDisplayNames";
import { createMockContext, createMockUser } from "#server/trpc/context.test";
import { D1_MAX_BOUND_PARAMETERS, getRowsPerStatement } from "@esposter/db";
import { roomsInMessage, RoomType, usersToRoomsInMessage } from "@esposter/db-schema";
import { chunk } from "@esposter/shared";
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
    const directMessageDisplayNames = getDirectMessageDisplayNames(context.db, viewer.id);
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

  // A direct message the viewer is alone in has no other participant to name, so its name is empty, but it keeps a row
  // Keyed By its own room, rather than sharing a null room's row with every other such direct message
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
    const directMessageDisplayNames = getDirectMessageDisplayNames(context.db, viewer.id);
    const rows = await context.db.select({ roomId: directMessageDisplayNames.roomId }).from(directMessageDisplayNames);

    expect(rows.map(({ roomId }) => roomId).toSorted()).toStrictEqual([aloneId, withOtherId].toSorted());
  });

  // A viewer with more direct messages than D1 binds in one statement is still named in full: the viewer's rooms are a
  // Subquery, so no parameter is bound per room
  test("names every direct message of a viewer past D1's parameter cap", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const viewer = await createMockUser(context.db);
    const roomIds = Array.from({ length: D1_MAX_BOUND_PARAMETERS + 1 }, () => v7());
    // Each write is one chunk of rows, so no statement binds more than the cap the read is held to
    const roomIdChunks = chunk(roomIds, getRowsPerStatement(roomsInMessage));
    await Promise.all(
      roomIdChunks.map((roomIdChunk) =>
        context.db
          .insert(roomsInMessage)
          .values(
            roomIdChunk.map((id) => ({
              id,
              name: "",
              participantKey: id,
              type: RoomType.DirectMessage,
              userId: viewer.id,
            })),
          ),
      ),
    );
    await Promise.all(
      roomIdChunks.map((roomIdChunk) =>
        context.db.insert(usersToRoomsInMessage).values(roomIdChunk.map((roomId) => ({ roomId, userId: viewer.id }))),
      ),
    );
    const directMessageDisplayNames = getDirectMessageDisplayNames(context.db, viewer.id);
    const query = context.db.select({ roomId: directMessageDisplayNames.roomId }).from(directMessageDisplayNames);
    const rows = await query;

    expect(rows.map(({ roomId }) => roomId).toSorted()).toStrictEqual(roomIds.toSorted());
    expect(query.toSQL().params.length).toBeLessThanOrEqual(D1_MAX_BOUND_PARAMETERS);
  });
});
