import { mockSessionOnce } from "#server/trpc/context.test";
import { getMemberRoomsProcedure } from "#server/trpc/procedure/room/getMemberRoomsProcedure";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { describe, expect, test } from "vitest";

describe(getMemberRoomsProcedure, () => {
  const { getMockContext, getRoomCaller, getRoomId } = setupRoomSuite();

  test("refuses a subscription to a room the caller has not joined", async () => {
    expect.hasAssertions();

    const roomCaller = getRoomCaller();
    const roomId = getRoomId();
    await mockSessionOnce(getMockContext().db);

    await expect(roomCaller.onJoinRoom([roomId])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });
});
