// @vitest-environment nuxt
import type { RoomReaction } from "@esposter/db-schema";

import { getMockSession } from "#server/trpc/context.test";
import { useReadEmojis } from "#src/composables/message/emoji/useReadEmojis";
import { useSession } from "#src/services/auth/authClient.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useEmojiStore } from "#src/store/message/emoji";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: undefined | { user: { id: string } };
}

describe(useEmojiStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const messageId = 1;
  const emojiTag = "👍";
  const createReaction = (userIds: string[] = [], version = 0): RoomReaction => ({
    emojiTag,
    messageId,
    userIds,
    version,
  });

  beforeEach(() => {
    useSession.mockReturnValue(ref<MockSessionValue>({ data: undefined }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // An arrival is the row as the room holds it at its version, so a row at an older version than the one held is a late
  // Copy and changes nothing
  test("stores an arrival only when its version is newer than the one held", () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const emojiStore = useEmojiStore();
    const { getEmojis, storeEmoji } = emojiStore;
    storeEmoji(roomId, createReaction([userId], 2));
    storeEmoji(roomId, createReaction([], 1));

    expect(getEmojis(roomId, messageId)).toStrictEqual([createReaction([userId], 2)]);
  });

  // The room's answer to a removal keeps the reaction with no reactor at its version, so a read that answered before the
  // Removal and arrives after it is older, and cannot put the reaction back
  test("a late read does not re-add a reaction the room has since removed", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const { promise: readResponse, resolve: resolveRead } = Promise.withResolvers<RoomReaction[]>();
    trpcMsw.message.emoji.readReactions.query(() => readResponse);
    trpcMsw.message.emoji.removeReaction.mutation(() => createReaction([], 2));
    const emojiStore = useEmojiStore();
    const { getEmojis, storeEmoji, toggleEmoji } = emojiStore;
    const readEmojis = useReadEmojis();
    storeEmoji(roomId, createReaction([userId], 1));
    const read = readEmojis(roomId, [messageId]);
    await toggleEmoji(roomId, createReaction([userId], 1));
    expect(getEmojis(roomId, messageId)).toStrictEqual([]);

    resolveRead([createReaction([userId], 1)]);
    await read;

    expect(getEmojis(roomId, messageId)).toStrictEqual([]);
  });

  // An event sent before the toggle's answer, and delivered after it, is at the version the toggle already passed
  test("an older event does not undo a newer toggle", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const otherUserId = v7();
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    trpcMsw.message.emoji.addReaction.mutation(() => createReaction([userId], 2));
    const emojiStore = useEmojiStore();
    const { getEmojis, storeEmoji, toggleEmoji } = emojiStore;
    storeEmoji(roomId, createReaction([], 0));
    await toggleEmoji(roomId, createReaction([], 0));
    storeEmoji(roomId, createReaction([otherUserId], 1));

    expect(getEmojis(roomId, messageId)).toStrictEqual([createReaction([userId], 2)]);
  });

  // A toggle is awaited, so the reaction shows nothing new until the room answers, and a refused one leaves it as the
  // Room holds it
  test("a refused toggle leaves the reaction as the room holds it, and shows nothing before the room answers", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const otherUserId = v7();
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const { promise: addResponse, reject: refuseAdd } = Promise.withResolvers<RoomReaction>();
    trpcMsw.message.emoji.addReaction.mutation(() => addResponse);
    const emojiStore = useEmojiStore();
    const { getEmojis, storeEmoji, toggleEmoji } = emojiStore;
    storeEmoji(roomId, createReaction([otherUserId], 1));
    const pendingToggle = toggleEmoji(roomId, createReaction([otherUserId], 1));
    await flushPromises();

    expect(getEmojis(roomId, messageId)).toStrictEqual([createReaction([otherUserId], 1)]);

    refuseAdd(new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " }));
    await pendingToggle;

    expect(getEmojis(roomId, messageId)).toStrictEqual([createReaction([otherUserId], 1)]);
  });

  // Reacting again removes the caller's own reaction, and adds it otherwise. A press made while the one before it is in
  // Flight is not sent, since the room has not yet answered what the first press did
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
      return createReaction([userId], 1);
    });
    trpcMsw.message.emoji.removeReaction.mutation(() => {
      calledProcedures.push("removeReaction");
      return createReaction([], 2);
    });
    const emojiStore = useEmojiStore();
    const { storeEmoji, toggleEmoji } = emojiStore;
    const emoji = createReaction(isReactor ? [userId] : []);
    storeEmoji(roomId, emoji);
    await toggleEmoji(roomId, emoji);

    expect(calledProcedures).toStrictEqual([expectedProcedure]);
  });

  test("does not send a press while the one before it on the same reaction is in flight", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const calledProcedures: string[] = [];
    const { promise: addResponse, resolve: resolveAdd } = Promise.withResolvers<RoomReaction>();
    trpcMsw.message.emoji.addReaction.mutation(() => {
      calledProcedures.push("addReaction");
      return addResponse;
    });
    trpcMsw.message.emoji.removeReaction.mutation(() => {
      calledProcedures.push("removeReaction");
      return createReaction([], 2);
    });
    const emojiStore = useEmojiStore();
    const { createEmoji, deleteEmoji, getEmojis } = emojiStore;
    const pendingAdd = createEmoji({ emojiTag, messageId, roomId });
    await flushPromises();
    await deleteEmoji({ emojiTag, messageId, roomId });
    resolveAdd(createReaction([userId], 1));
    await pendingAdd;

    expect(calledProcedures).toStrictEqual(["addReaction"]);
    expect(getEmojis(roomId, messageId)).toStrictEqual([createReaction([userId], 1)]);
  });
});
