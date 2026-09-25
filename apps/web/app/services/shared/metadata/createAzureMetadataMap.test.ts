import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { createAzureMetadataMap } from "@/services/shared/metadata/createAzureMetadataMap";
import { MessageMetadataType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { beforeEach, describe, expect, test } from "vitest";

describe(createAzureMetadataMap, () => {
  let azureMetadataMap: ReturnType<typeof createAzureMetadataMap<MessageMetadataType.Emoji>>;
  const partitionKey = crypto.randomUUID();
  const rowKey = crypto.randomUUID();
  const messageRowKey = crypto.randomUUID();

  beforeEach(() => {
    azureMetadataMap = createAzureMetadataMap(MessageMetadataType.Emoji);
  });

  test("gets", () => {
    expect.hasAssertions();

    const { getEmojis } = azureMetadataMap;
    const emojis = getEmojis(partitionKey, rowKey);

    expect(emojis).toHaveLength(0);
  });

  test("sets", () => {
    expect.hasAssertions();

    const { getEmojis, setEmojis } = azureMetadataMap;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    setEmojis(partitionKey, messageRowKey, [newEmoji]);
    const emojis = getEmojis(partitionKey, messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(takeOne(emojis)).toStrictEqual(newEmoji);
  });
});
