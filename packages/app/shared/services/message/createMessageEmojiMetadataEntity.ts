import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";

import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { getReverseTickedTimestamp, MessageMetadataType } from "@esposter/db-schema";

export const createMessageEmojiMetadataEntity = (
  input: CreateEmojiInput & Pick<MessageEmojiMetadataEntity, "userIds">,
) =>
  new MessageEmojiMetadataEntity({
    ...input,
    rowKey: getReverseTickedTimestamp(),
    type: MessageMetadataType.Emoji,
  });
