import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { createAzureMetadataMap } from "@/services/shared/metadata/createAzureMetadataMap";
import { beforeEach, describe, expect, test } from "vitest";

describe(createAzureMetadataMap, () => {
  let azureMetadataMap: ReturnType<typeof createAzureMetadataMap<MessageMetadataType.Emoji>>;
  const currentId = "0";
  const rowKey = "0";

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
    let emojis = getEmojis(rowKey);

    expect(emojis).toHaveLength(0);

    const newEmoji = new MessageEmojiMetadataEntity();
    emojis.push(newEmoji);
    setEmojis(rowKey, emojis);
    emojis = getEmojis(rowKey);

    expect(emojis).toHaveLength(1);
    expect(emojis[0]).toStrictEqual(newEmoji);
  });
});
