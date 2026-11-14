import type { ReverseTickedTimestamp } from "#src/models/streams/ReverseTickedTimestamp";
import type { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";

import { AzureMetadataEntity } from "#src/models/streams/AzureMetadataEntity";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  declare messageRowKey: ReverseTickedTimestamp;
  declare rowKey: ReverseTickedTimestamp;
}
