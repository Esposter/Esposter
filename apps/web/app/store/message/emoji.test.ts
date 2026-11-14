// @vitest-environment nuxt
import { getMockSession } from "#server/trpc/context.test";
import { useSession } from "@/services/auth/authClient.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useEmojiStore } from "@/store/message/emoji";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: { user: { id: string } };
}
vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useEmojiStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const messageId = 1;
  const emojiTag = "👍";
  const createReaction = (userIds: string[] = []) => ({ emojiTag, messageId, userIds });

  beforeEach(() => {
    useSession.mockReturnValue(ref<MockSessionValue>({ data: undefined }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("stores an event's row, replacing the one it names", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeEmoji } = emojiStore;
    storeEmoji(roomId, createReaction());
    const userId = getMockSession().user.id;
    storeEmoji(roomId, createReaction([userId]));

    expect(getEmojis(roomId, messageId)).toStrictEqual([createReaction([userId])]);
  });

  test("deletes", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeDeleteEmoji, storeEmoji } = emojiStore;
    storeEmoji(roomId, createReaction());
    storeDeleteEmoji(roomId, createReaction());

    expect(getEmojis(roomId, messageId)).toStrictEqual([]);
  });

  // Reacting again removes the caller's own reaction, and adds it otherwise. The reaction row is shared, so leaving it is
  // only ever a removal: the row goes with its last reactor and stays for everyone else
  test.each([
    { expectedProcedure: "removeReaction", isReactor: true },
    { expectedProcedure: "addReaction", isReactor: false },
  ])("toggles through $expectedProcedure", async ({ expectedProcedure, isReactor }) => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const calledProcedures: string[] = [];
    trpcMsw.message.emoji.addReaction.mutation(() => {
      calledProcedures.push("addReaction");
      return createReaction([userId]);
    });
    trpcMsw.message.emoji.removeReaction.mutation(() => {
      calledProcedures.push("removeReaction");
    });
    const emojiStore = useEmojiStore();
    const { setEmojis, toggleEmoji } = emojiStore;
    const emoji = createReaction(isReactor ? [userId] : []);
    setEmojis(roomId, messageId, [emoji]);
    await toggleEmoji(roomId, emoji);

    expect(calledProcedures).toStrictEqual([expectedProcedure]);
  });

  // The toggle's rollback takes the caller off the reaction as it stands, so another member's reaction delivered while
  // the rejected write was in flight is kept
  test("keeps a reaction delivered while the rejected toggle was in flight", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const otherUserId = v7();
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const emojiStore = useEmojiStore();
    const { createEmoji, getEmojis, setEmojis, storeEmoji } = emojiStore;
    trpcMsw.message.emoji.addReaction.mutation(() => {
      storeEmoji(roomId, createReaction([otherUserId, userId]));
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    setEmojis(roomId, messageId, [createReaction([otherUserId])]);
    await createEmoji({ emojiTag, messageId, roomId });

    expect(takeOne(getEmojis(roomId, messageId)).userIds).toStrictEqual([otherUserId]);
  });
});
