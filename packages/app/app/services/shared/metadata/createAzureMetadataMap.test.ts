import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { createAzureMetadataMap } from "@/services/shared/metadata/createAzureMetadataMap";
import { MessageMetadataType } from "@esposter/db-schema";
import { beforeEach, describe, expect, test } from "vitest";

describe(createAzureMetadataMap, () => {
  let azureMetadataMap: ReturnType<typeof createAzureMetadataMap<MessageMetadataType.Emoji>>;
  const currentId = "currentId";
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";
  const messageRowKey = "messageRowKey";

  beforeEach(() => {
    azureMetadataMap = createAzureMetadataMap(() => currentId, MessageMetadataType.Emoji);
  });

  test("gets", () => {
    expect.hasAssertions();

    const { getEmojis } = azureMetadataMap;
    const emojis = getEmojis(rowKey);

    expect(emojis).toHaveLength(0);
  });

  test("sets", () => {
    expect.hasAssertions();

    const { getEmojis, setEmojis } = azureMetadataMap;
    const newEmoji = new MessageEmojiMetadataEntity({ messageRowKey, partitionKey, rowKey });
    setEmojis(messageRowKey, [newEmoji]);
    const emojis = getEmojis(messageRowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0]).toStrictEqual(newEmoji);
  });
});
