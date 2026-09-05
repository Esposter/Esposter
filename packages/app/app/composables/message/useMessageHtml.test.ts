// @vitest-environment nuxt
import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";

import { useMessageHtml } from "@/composables/message/useMessageHtml";
import { EmojiType } from "@/models/message/emoji/EmojiType";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { useRoomEmojiStore } from "@/store/message/room/emoji";
import { useUserStore } from "@/store/message/user";
import {
  CUSTOM_EMOJI_ID_ATTRIBUTE,
  CUSTOM_EMOJI_NAME_ATTRIBUTE,
  MENTION_ID_ATTRIBUTE,
  MENTION_TYPE,
  MENTION_TYPE_ATTRIBUTE,
} from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

const createMention = (id: string) =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${id}">@stale</span>`;

describe(useMessageHtml, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const roomEmojiId = crypto.randomUUID();
  const name = "party_parrot";
  const sasUrl = "https://storage.test/message-assets/emoji?sig=a&se=b";
  const displayName = "renamed";
  const roomEmoji: RoomEmojiWithSasUrl = {
    createdAt: new Date(0),
    deletedAt: null,
    id: roomEmojiId,
    name,
    roomId,
    sasUrl,
    updatedAt: new Date(0),
  };
  const createCustomEmojiNode = (id: string) =>
    `<span ${CUSTOM_EMOJI_ID_ATTRIBUTE}="${id}" ${CUSTOM_EMOJI_NAME_ATTRIBUTE}="${name}">:${name}:</span>`;

  beforeEach(() => {
    setActivePinia(createPinia());
    // The rewrite reads the room on screen's emoji set, which is the room these messages are rendered in
    setCurrentRoomId(roomId);
  });

  // The tree that is queried has to be the tree that is serialized: query one and serialize a second and every
  // Mutation lands on a copy nobody reads, so a renamed member still renders the label it was authored with
  test("resolves a mention to the name the reader's client knows", () => {
    expect.hasAssertions();

    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser(createUser({ id: userId, name: displayName }));
    const messageHtml = useMessageHtml(createMention(userId), roomId);

    expect(messageHtml.value).toContain(`@${displayName}`);
  });

  test("resolves a custom emoji node to its image", () => {
    expect.hasAssertions();

    const roomEmojiStore = useRoomEmojiStore();
    const { storeCreateRoomEmoji } = roomEmojiStore;
    storeCreateRoomEmoji(roomId, roomEmoji);
    const messageHtml = useMessageHtml(createCustomEmojiNode(roomEmojiId), roomId);

    expect(messageHtml.value).toContain(`src="${sasUrl.replaceAll("&", "&amp;")}"`);
    expect(messageHtml.value).toContain(`alt=":${name}:"`);
  });

  // An emoji the room no longer has is data rather than an error: the node keeps the shortcode it was authored
  // With, and the message around it renders
  test("leaves a node whose emoji is gone exactly as it was authored", () => {
    expect.hasAssertions();

    const messageHtml = useMessageHtml(createCustomEmojiNode(roomEmojiId), roomId);

    expect(messageHtml.value).toBe(createCustomEmojiNode(roomEmojiId));
  });

  test("stamps the emoji type on the room's own set", () => {
    expect.hasAssertions();

    const roomEmojiStore = useRoomEmojiStore();
    const { storeCreateRoomEmoji } = roomEmojiStore;
    storeCreateRoomEmoji(roomId, roomEmoji);

    expect(roomEmojiStore.customEmojis).toStrictEqual([
      { id: roomEmojiId, name, sasUrl, slug: name, type: EmojiType.Custom },
    ]);
  });
});
