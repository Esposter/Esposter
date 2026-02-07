import type { Router } from "vue-router";

import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { useEmojiStore } from "@/store/message/emoji";
import { getMockSession } from "@@/server/trpc/context.test";
import { MockContainerDatabase } from "azure-mock";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useEmojiStore, () => {
  let router: Router;
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const messageRowKey = "messageRowKey";

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = crypto.randomUUID();
  });

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("gets", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis } = emojiStore;
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(0);
  });

  test("sets", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, setEmojis } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    setEmojis(messageRowKey, [newEmoji]);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0]).toStrictEqual(newEmoji);
  });

  test("creates", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0]).toStrictEqual(newEmoji);
  });

  test("updates", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji, storeUpdateEmoji } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);

    const userId = getMockSession().user.id;
    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    const updatedEmoji = { ...newEmoji, userIds: [userId] };
    storeUpdateEmoji(updatedEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0]).toStrictEqual(new MessageEmojiMetadataEntity(updatedEmoji));
  });

  test("deletes", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji, storeDeleteEmoji } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);
    storeDeleteEmoji(newEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(0);
  });
});
