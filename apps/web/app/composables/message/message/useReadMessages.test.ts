// @vitest-environment nuxt
import { useReadMessages } from "@/composables/message/message/useReadMessages";
import { createMessage } from "@/services/message/message/createMessage.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useEmojiStore } from "@/store/message/emoji";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadMessages, () => {
  const { trpcMsw } = setupMswTrpc();
  let readMessages: ReturnType<typeof useReadMessages>["readMessages"];
  let getEmojis: ReturnType<typeof useEmojiStore>["getEmojis"];
  const roomId = v7();
  const otherRoomId = v7();
  const emojiTag = "👍";

  // A page's metadata is read after the page lands, so a room switched to in between must not become the room the
  // Reactions are read for and filed under — the room being left would come back with none
  test("files a page's reactions under the room the page was read for", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const message = createMessage(roomId);
    const emoji = { emojiTag, messageId: message.id, userIds: [] as string[] };
    trpcMsw.message.readMessages.query(async () => {
      await readGate;
      return { hasMore: false, items: [message], nextCursor: "" };
    });
    trpcMsw.room.readUsersByIds.query(() => []);
    trpcMsw.message.emoji.readEmojis.query(({ input }) => (input.roomId === roomId ? [emoji] : []));
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

    expect(getEmojis(roomId, message.id).map((reaction) => reaction.emojiTag)).toStrictEqual([emojiTag]);
  });
});
