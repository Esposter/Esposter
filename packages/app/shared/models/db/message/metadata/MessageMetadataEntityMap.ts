import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";

export interface MessageMetadataEntityMap {
  [MessageMetadataType.Emoji]: MessageEmojiMetadataEntity;
}
