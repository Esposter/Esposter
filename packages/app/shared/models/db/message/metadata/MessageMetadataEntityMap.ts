import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import type { MessageReplyMetadataEntity } from "#shared/models/db/message/metadata/MessageReplyMetadataEntity";

export interface MessageMetadataEntityMap {
  [MessageMetadataType.Emoji]: MessageEmojiMetadataEntity;
  [MessageMetadataType.Reply]: MessageReplyMetadataEntity;
}
