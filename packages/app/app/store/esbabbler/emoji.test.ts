import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { MockContainerClientMap } from "@@/server/composables/azure/useContainerClient.test";
import { getMockSession } from "@@/server/trpc/context.test";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(useEmojiStore, () => {
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const messageRowKey = "messageRowKey";

  beforeEach(() => {
    setActivePinia(createPinia());

    const router = useRouter();
    router.currentRoute.value.params.id = crypto.randomUUID();
  });

  afterEach(() => {
    MockContainerClientMap.clear();
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
