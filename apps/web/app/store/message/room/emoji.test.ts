// @vitest-environment nuxt
import type { RoomEmojiWithPresignedUrl } from "@esposter/db-schema";

import { EmojiType } from "#src/models/message/emoji/EmojiType";
import { roomEmojiTable } from "#src/services/message/room/overlay/constants";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useRoomEmojiStore } from "#src/store/message/room/emoji";
import { useOverlayStore } from "#src/store/overlay";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useRoomEmojiStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const presignedUrl = "https://example.com/emoji.png";

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  const createRoomEmoji = (): RoomEmojiWithPresignedUrl => ({
    createdAt: new Date(0),
    deletedAt: null,
    id: v7(),
    name: "name",
    presignedUrl,
    roomId,
    updatedAt: new Date(0),
    version: 0,
  });

  // A removal and a creation that land while the room's set is read are held over its answer: the removal at a higher
  // Version than the answer's live copy of the same emoji, and the creation because the answer predates it
  test("keeps a removal and a creation that land during the read over its answer", async () => {
    expect.hasAssertions();

    setCurrentRoomId(roomId);
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    const kept = createRoomEmoji();
    const removed = createRoomEmoji();
    const addedRoomEmoji = { ...createRoomEmoji(), name: "addedRoomEmoji" };
    trpcMsw.room.emoji.readRoomEmojis.query(() => {
      arrive(roomEmojiTable, { ...removed, deletedAt: new Date(0), version: 1 });
      arrive(roomEmojiTable, addedRoomEmoji);
      return [kept, removed];
    });
    const roomEmojiStore = useRoomEmojiStore();
    const { readRoomEmojis } = roomEmojiStore;
    const { items } = storeToRefs(roomEmojiStore);
    await readRoomEmojis(roomId);

    // The set has no order of its own, so the two live emoji are named as members of it
    expect(items.value).toHaveLength(2);
    expect(items.value).toStrictEqual(expect.arrayContaining([kept, addedRoomEmoji]));
  });

  test("stamps the emoji type on the room's own set", () => {
    expect.hasAssertions();

    setCurrentRoomId(roomId);
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    const roomEmoji = createRoomEmoji();
    arrive(roomEmojiTable, roomEmoji);
    const roomEmojiStore = useRoomEmojiStore();
    const { customEmojis } = storeToRefs(roomEmojiStore);

    expect(customEmojis.value).toStrictEqual([
      { id: roomEmoji.id, name: roomEmoji.name, presignedUrl, slug: roomEmoji.name, type: EmojiType.Custom },
    ]);
  });

  // The removal leaves the set at once, and its answer keeps it out
  test("a removal leaves the emoji out at once, and its answer keeps it out", async () => {
    expect.hasAssertions();

    setCurrentRoomId(roomId);
    const overlayStore = useOverlayStore();
    const { arrive } = overlayStore;
    const roomEmoji = createRoomEmoji();
    arrive(roomEmojiTable, roomEmoji);
    trpcMsw.room.emoji.deleteRoomEmoji.mutation(() => ({ ...roomEmoji, deletedAt: new Date(0), version: 1 }));
    const roomEmojiStore = useRoomEmojiStore();
    const { items } = storeToRefs(roomEmojiStore);
    const { deleteRoomEmoji } = roomEmojiStore;
    deleteRoomEmoji({ id: roomEmoji.id, roomId });

    expect(items.value).toStrictEqual([]);

    await flushPromises();

    expect(items.value).toStrictEqual([]);
  });
});
