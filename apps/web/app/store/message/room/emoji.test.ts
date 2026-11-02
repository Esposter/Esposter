// @vitest-environment nuxt
import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";

import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { getMockSasUrl } from "azure-mock";
import { describe, expect, test } from "vitest";

describe(useRoomEmojiStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const sasUrl = getMockSasUrl("", undefined);
  const createRoomEmoji = (): RoomEmojiWithSasUrl => ({
    createdAt: new Date(0),
    deletedAt: null,
    id: crypto.randomUUID(),
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
