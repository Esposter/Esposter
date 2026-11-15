import { resolveLiveInvite } from "#server/services/room/resolveLiveInvite";
import { getMockSession } from "#server/trpc/context.test";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { bansInMessage, invitesInMessage } from "@esposter/db-schema";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(resolveLiveInvite, () => {
  const { createMember, getMockContext, getRoomId } = setupRoomSuite();
  const epoch = new Date(0);
  const inviteId = "a".repeat(SECRET_TOKEN_LENGTH);

  // The two refusals a link carries itself, each set on the row the link is read from
  test.each([
    ["expired", { expiresAt: epoch }],
    ["exhausted", { maxUses: 1, uses: 1 }],
  ])("refuses an %s link", async (_label, linkFields) => {
    expect.hasAssertions();

    const roomId = getRoomId();
    const userId = getMockSession().user.id;
    await getMockContext()
      .db.insert(invitesInMessage)
      .values({ id: inviteId, roomId, userId, ...linkFields });
    const resolvedInvite = await resolveLiveInvite(getMockContext().db, inviteId, userId);

    expect(resolvedInvite).toBeUndefined();
  });

  // A ban is refused only while it is active, so a member whose ban was lifted resolves the link again
  test("resolves a link for a member whose ban has been lifted", async () => {
    expect.hasAssertions();

    const roomId = getRoomId();
    const member = await createMember();
    await getMockContext()
      .db.insert(invitesInMessage)
      .values({ id: inviteId, roomId, userId: getMockSession().user.id });
    await getMockContext().db.insert(bansInMessage).values({ deletedAt: epoch, roomId, userId: member.id });
    const resolvedInvite = await resolveLiveInvite(getMockContext().db, inviteId, member.id);

    expect(resolvedInvite?.id).toBe(inviteId);
  });
});
