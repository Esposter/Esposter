import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import type { MessageReplyMetadataEntity } from "#shared/models/db/message/metadata/MessageReplyMetadataEntity";

export interface MessageMetadataEntityMap {
  [MessageMetadataType.Emoji]: MessageEmojiMetadataEntity;
  // @TODO: Not Implemented
  [MessageMetadataType.ReadReceipt]: MessageEmojiMetadataEntity;
  [MessageMetadataType.Reply]: MessageReplyMetadataEntity;
}
