// @vitest-environment nuxt
import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { useReadMessages } from "@/composables/message/message/useReadMessages";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useEmojiStore } from "@/store/message/emoji";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe(useReadMessages, () => {
  const server = setupMswTrpc();
  let readMessages: ReturnType<typeof useReadMessages>["readMessages"];
  let getEmojis: ReturnType<typeof useEmojiStore>["getEmojis"];
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();

  // A page's metadata is read after the page lands, so a room switched to in between must not become the room the
  // Reactions are read for and filed under — the room being left would come back with none
  test("files a page's reactions under the room the page was read for", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const message = createMessageEntity({ roomId, type: MessageType.Message, userId: crypto.randomUUID() });
    const emoji = new MessageEmojiMetadataEntity({
      messageRowKey: message.rowKey,
      partitionKey: roomId,
      rowKey: crypto.randomUUID(),
    });
    server.use(
      trpcMsw.message.readMessages.query(async () => {
        await readGate;
        return { hasMore: false, items: [message], nextCursor: "" };
      }),
      trpcMsw.room.readMembersByIds.query(() => []),
      trpcMsw.message.emoji.readEmojis.query(({ input }) => (input.roomId === roomId ? [emoji] : [])),
    );
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(roomId);
          const emojiStore = useEmojiStore();
          ({ getEmojis } = emojiStore);
          ({ readMessages } = useReadMessages());
        },
      }),
    );
    const pendingRead = readMessages();
    await flushPromises();
    setCurrentRoomId(otherRoomId);
    releaseRead();
    await pendingRead;

    expect(getEmojis(roomId, message.rowKey).map(({ rowKey }) => rowKey)).toStrictEqual([emoji.rowKey]);
  });
});
