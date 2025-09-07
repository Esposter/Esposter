import type { CreateEmojiInput } from "#shared/models/db/message/metadata/CreateEmojiInput";

import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";

export const createMessageEmojiMetadataEntity = (
  input: CreateEmojiInput & Pick<MessageEmojiMetadataEntity, "userIds">,
) =>
  new MessageEmojiMetadataEntity({
    ...input,
    rowKey: getReverseTickedTimestamp(),
    type: MessageMetadataType.Emoji,
  });
