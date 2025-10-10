import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { MessageMetadataType } from "@esposter/db-schema";

export interface MessageMetadataEntityMap {
  [MessageMetadataType.Emoji]: MessageEmojiMetadataEntity;
}
