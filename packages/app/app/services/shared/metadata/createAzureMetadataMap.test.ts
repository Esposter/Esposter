import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { createAzureMetadataMap } from "@/services/shared/metadata/createAzureMetadataMap";
import { beforeEach, describe, expect, test } from "vitest";

describe("createAzureMetadataMap", () => {
  let azureMetadataMap: ReturnType<typeof createAzureMetadataMap<MessageMetadataType.Emoji>>;
  const currentId = "0";
  const rowKey = "0";

  beforeEach(() => {
    azureMetadataMap = createAzureMetadataMap(currentId, MessageMetadataType.Emoji);
  });

  test("gets", () => {
    expect.hasAssertions();

    const { getEmojiList } = azureMetadataMap;
    const emojiList = getEmojiList(rowKey);

    expect(emojiList).toHaveLength(0);
  });

  test("sets", () => {
    expect.hasAssertions();

    const { getEmojiList, setEmojiList } = azureMetadataMap;
    let emojiList = getEmojiList(rowKey);

    expect(emojiList).toHaveLength(0);

    const newEmoji = new MessageEmojiMetadataEntity();
    emojiList.push(newEmoji);
    setEmojiList(rowKey, emojiList);
    emojiList = getEmojiList(rowKey);

    expect(emojiList).toHaveLength(1);
    expect(emojiList[0]).toStrictEqual(newEmoji);
  });
});
