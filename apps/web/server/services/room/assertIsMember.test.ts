import { assertIsMember } from "@@/server/services/room/assertIsMember";
import { getMockSession } from "@@/server/trpc/context.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { describe, expect, test } from "vitest";

describe(assertIsMember, () => {
  const { getMockContext, getRoomId } = setupRoomSuite();

  test("accepts a repeated room id", async () => {
    expect.hasAssertions();

    const roomId = getRoomId();

    await expect(assertIsMember(getMockContext().db, getMockSession(), [roomId, roomId])).resolves.toBeUndefined();
  });

  test("rejects a room the caller is not in beside one they are", async () => {
    expect.hasAssertions();

    await expect(
      assertIsMember(getMockContext().db, getMockSession(), [getRoomId(), crypto.randomUUID()]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);
  });
});
