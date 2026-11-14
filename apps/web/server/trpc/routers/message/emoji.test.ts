import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { RoomObjectRpc } from "@esposter/db-schema";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "#server/trpc";
import { getMockSession } from "#server/trpc/context.test";
import { emojiRouter } from "#server/trpc/routers/message/emoji";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// A reaction is held by its message's room, so the room's object is faked: each method answers what a test sets, and
// the router's own work — who the reactor is, and what a missing reaction is — is what the tests read
const { roomObject } = vi.hoisted(() => ({
  roomObject: {
    addReaction: vi.fn<RoomObjectRpc["addReaction"]>(),
    readReactions: vi.fn<RoomObjectRpc["readReactions"]>(),
    removeReaction: vi.fn<RoomObjectRpc["removeReaction"]>(),
  },
}));
vi.mock("#server/composables/realtime/useRoomObject", () => ({ useRoomObject: () => roomObject }));

describe("emojiRouter", () => {
  const { getMockContext, getRoomId } = setupRoomSuite();
  let mockContext: Context;
  let emojiCaller: DecorateRouterRecord<TRPCRouter["message"]["emoji"]>;
  let roomId: string;
  const emojiTag = "👍";
  const messageId = 1;

  beforeAll(() => {
    mockContext = getMockContext();
    emojiCaller = createCallerFactory(emojiRouter)(mockContext);
  });

  beforeEach(() => {
    roomId = getRoomId();
  });

  test("adds the caller as a reactor and returns the reaction the room holds", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const reaction = { emojiTag, messageId, userIds: [userId] };
    roomObject.addReaction.mockResolvedValue(reaction);

    const newReaction = await emojiCaller.addReaction({ emojiTag, messageId, roomId });

    expect(newReaction).toStrictEqual(reaction);
    expect(roomObject.addReaction).toHaveBeenCalledExactlyOnceWith({ emojiTag, messageId }, { userId });
  });

  test("fails addReaction on a message the room does not hold", async () => {
    expect.hasAssertions();

    const input = { roomId, emojiTag, messageId };
    roomObject.addReaction.mockResolvedValue(null);

    await expect(emojiCaller.addReaction(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Message, JSON.stringify(input)).message}]`,
    );
  });

  test("removes the caller from the reactors of a reaction", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    roomObject.removeReaction.mockResolvedValue(true);

    await emojiCaller.removeReaction({ emojiTag, messageId, roomId });

    expect(roomObject.removeReaction).toHaveBeenCalledExactlyOnceWith({ emojiTag, messageId }, { userId });
  });

  test("fails removeReaction by a caller who is not one of its reactors", async () => {
    expect.hasAssertions();

    const input = { roomId, emojiTag, messageId };
    roomObject.removeReaction.mockResolvedValue(false);

    await expect(emojiCaller.removeReaction(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.Reaction, JSON.stringify(input)).message}]`,
    );
  });

  test("reads the reactions of the messages it names from the room", async () => {
    expect.hasAssertions();

    const reaction = { emojiTag, messageId, userIds: [getMockSession().user.id] };
    roomObject.readReactions.mockResolvedValue([reaction]);

    const reactions = await emojiCaller.readReactions({ messageIds: [messageId], roomId });

    expect(reactions).toStrictEqual([reaction]);
    expect(roomObject.readReactions).toHaveBeenCalledExactlyOnceWith([messageId]);
  });
});
