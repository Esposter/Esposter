import { getDirectMessageDisplayNames } from "#server/services/room/getDirectMessageDisplayNames";
import { createMockContext } from "#server/trpc/context.test";
import { sql } from "drizzle-orm";
import { describe, expect, test } from "vitest";

// The sidebar reads the participant names of every direct message it lists, so the query starts from the viewer's rooms
// Through an index, rather than scanning every direct message or every membership
describe(getDirectMessageDisplayNames, () => {
  test("the participant names are searched by the viewer's rooms and their memberships, not scanned", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const directMessageDisplayNames = getDirectMessageDisplayNames(context.db, context.user.id);
    const query = context.db
      .select({ displayName: directMessageDisplayNames.displayName, roomId: directMessageDisplayNames.roomId })
      .from(directMessageDisplayNames);
    const plan = await context.db.all(sql`EXPLAIN QUERY PLAN ${query.getSQL()}`);
    const details = plan.map((row) => (row as { detail: string }).detail);

    expect(details.filter((detail) => /^SCAN (message_rooms|participantMembership)\b/u.test(detail))).toStrictEqual([]);
  });
});
