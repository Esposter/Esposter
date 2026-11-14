import type { StreamTable } from "#src/models/streams/StreamTable";
import type { MessageEntity } from "#src/models/message/MessageEntity";
import type { MessageMetadataEntity } from "#src/models/message/metadata/MessageMetadataEntity";
import type { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";

export interface StreamTableEntityMap {
  [StreamTable.Messages]: MessageEntity;
  [StreamTable.MessagesMetadata]: MessageMetadataEntity<MessageMetadataType>;
}
