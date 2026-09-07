// @vitest-environment nuxt

import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useEmojiStore } from "@/store/message/emoji";
import { getMockSession } from "@@/server/trpc/context.test";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { MockContainerDatabase } from "azure-mock";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: { user: { id: string } };
}
const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<() => Ref<MockSessionValue>>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe(useEmojiStore, () => {
  const server = setupMswTrpc();
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const messageRowKey = "messageRowKey";

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(crypto.randomUUID());
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: undefined }));
  });

  afterEach(() => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
  });

  test("creates", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toStrictEqual([newEmoji]);
  });

  test("updates", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji, storeUpdateEmoji } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);

    const userId = getMockSession().user.id;
    // oxlint-disable-next-line typescript/no-misused-spread
    const updatedEmoji = { ...newEmoji, userIds: [userId] };
    storeUpdateEmoji(updatedEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toStrictEqual([new MessageEmojiMetadataEntity(updatedEmoji)]);
  });

  test("deletes", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji, storeDeleteEmoji } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);
    storeDeleteEmoji(newEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toStrictEqual([]);
  });

  // The reaction row is shared, so leaving it is only ever a write — the row goes with the last reactor and
  // Stays for everyone else, which is what stops one member's undo taking the others' reactions with it
  test.each([
    { expectedProcedure: "deleteEmoji", userIds: [] as string[] },
    { expectedProcedure: "updateEmoji", userIds: [crypto.randomUUID()] },
  ])("toggles off through $expectedProcedure when the others are $userIds", async ({ expectedProcedure, userIds }) => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const calledProcedures: string[] = [];
    server.use(
      trpcMsw.message.emoji.deleteEmoji.mutation(() => {
        calledProcedures.push("deleteEmoji");
      }),
      trpcMsw.message.emoji.updateEmoji.mutation(() => {
        calledProcedures.push("updateEmoji");
      }),
    );
    const emojiStore = useEmojiStore();
    const { setEmojis, toggleEmoji } = emojiStore;
    const emoji = new MessageEmojiMetadataEntity({
      messageRowKey,
      partitionKey,
      rowKey,
      userIds: [userId, ...userIds],
    });
    setEmojis(messageRowKey, [emoji]);
    await toggleEmoji(emoji);

    expect(calledProcedures).toStrictEqual([expectedProcedure]);
  });

  // A reaction is a shared row, so the toggle owes back only the caller's own id and is unwound against the ids
  // As they stand
  test("keeps a reaction delivered while the rejected toggle was in flight", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const otherUserId = crypto.randomUUID();
    useSessionMock.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userId } } }));
    const emojiStore = useEmojiStore();
    const { getEmojis, setEmojis, storeUpdateEmoji, updateEmoji } = emojiStore;
    server.use(
      trpcMsw.message.emoji.updateEmoji.mutation(() => {
        // Another member's reaction, delivered from inside the request so it lands after the toggle applied and
        // Before its rejection unwinds
        storeUpdateEmoji(
          new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey, userIds: [userId, otherUserId] }),
        );
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    setEmojis(messageRowKey, [new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey })]);
    await updateEmoji({ messageRowKey, partitionKey, rowKey, userIds: [] });

    expect(takeOne(getEmojis(messageRowKey)).userIds).toStrictEqual([otherUserId]);
  });

  // Both removals name the same reaction, so the second runs behind the first and is refused because the row is
  // Already gone — reading the reaction before the write ahead of it ran puts it back on the message
  test("does not put back a reaction the removal ahead of it took off", async () => {
    expect.hasAssertions();

    let isFailing = false;
    server.use(
      trpcMsw.message.emoji.deleteEmoji.mutation(() => {
        if (isFailing) throw new TRPCError({ code: "NOT_FOUND", message: "error" });

        isFailing = true;
      }),
    );
    const emojiStore = useEmojiStore();
    const { deleteEmoji, getEmojis, setEmojis } = emojiStore;
    setEmojis(messageRowKey, [new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey })]);
    const input = { messageRowKey, partitionKey, rowKey };
    await Promise.all([deleteEmoji(input), deleteEmoji(input)]);

    expect(getEmojis(messageRowKey)).toHaveLength(0);
  });
});
