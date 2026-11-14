import type { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";
import type { ReverseTickedTimestamp } from "#src/models/message/ReverseTickedTimestamp";

import { AzureMetadataEntity } from "#src/models/message/metadata/AzureMetadataEntity";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  declare messageRowKey: ReverseTickedTimestamp;
  declare rowKey: ReverseTickedTimestamp;
}
