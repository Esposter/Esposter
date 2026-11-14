// @vitest-environment nuxt
import type { RoomEmojiWithSasUrl } from "@esposter/db-schema";

import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useRoomEmojiStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const sasUrl = "https://example.com/emoji.png";
  const createRoomEmoji = (): RoomEmojiWithSasUrl => ({
    createdAt: new Date(0),
    deletedAt: null,
    id: v7(),
    name: "name",
    roomId,
    sasUrl,
    updatedAt: new Date(0),
  });

  // The room's subscription is open while its set is read, so a removal and a creation that land in that window are
  // Not in the answer's favour: the answer may still list the removed emoji and not the created one
  test("replays a removal and a creation that land during the read over its answer", async () => {
    expect.hasAssertions();

    const roomEmojiStore = useRoomEmojiStore();
    const kept = createRoomEmoji();
    const removed = createRoomEmoji();
    const createdRoomEmoji = createRoomEmoji();
    trpcMsw.room.emoji.readRoomEmojis.query(() => {
      roomEmojiStore.storeDeleteRoomEmoji(roomId, { id: removed.id });
      roomEmojiStore.storeCreateRoomEmoji(roomId, createdRoomEmoji);
      return [kept, removed];
    });
    await roomEmojiStore.readRoomEmojis(roomId);

    expect(roomEmojiStore.getSlice(roomId).items.value).toStrictEqual([kept, createdRoomEmoji]);
  });
});
