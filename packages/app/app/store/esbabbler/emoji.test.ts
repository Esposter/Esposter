import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { useEmojiStore } from "@/store/esbabbler/emoji";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useEmojiStore, () => {
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const messageRowKey = "messageRowKey";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("gets", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis } = emojiStore;
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(0);
  });

  test.todo("sets", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, setEmojis } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    setEmojis(messageRowKey, [newEmoji]);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0]).toStrictEqual(newEmoji);
  });

  test.todo("creates", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji } = emojiStore;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0]).toStrictEqual(newEmoji);
  });

  test.todo("updates", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji, storeUpdateEmoji } = emojiStore;

    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);
    storeUpdateEmoji(newEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0].userIds).toHaveLength(1);
  });

  test.todo("updates twice to reset", () => {
    expect.hasAssertions();

    const emojiStore = useEmojiStore();
    const { getEmojis, storeCreateEmoji, storeUpdateEmoji } = emojiStore;

    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    storeCreateEmoji(newEmoji);
    storeUpdateEmoji(newEmoji);
    storeUpdateEmoji(newEmoji);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0].userIds).toHaveLength(0);
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
