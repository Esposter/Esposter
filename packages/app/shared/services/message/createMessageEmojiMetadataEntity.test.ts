import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { MessageMetadataType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(createMessageEmojiMetadataEntity, () => {
  test("creates", () => {
    expect.hasAssertions();

    const newMessageEmojiMetadataEntity = createMessageEmojiMetadataEntity({
      emojiTag: "",
      messageRowKey: "",
      partitionKey: "",
      userIds: [],
    });

    expect(newMessageEmojiMetadataEntity).toBeInstanceOf(MessageEmojiMetadataEntity);
    expect(newMessageEmojiMetadataEntity).toStrictEqual(
      expect.objectContaining({
        emojiTag: "",
        messageRowKey: "",
        partitionKey: "",
        type: MessageMetadataType.Emoji,
        userIds: [],
      }),
    );
  });
});
