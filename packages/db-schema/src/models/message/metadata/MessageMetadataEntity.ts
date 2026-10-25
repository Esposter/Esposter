import type { ReverseTickedTimestamp } from "#src/models/azure/table/ReverseTickedTimestamp";
import type { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";

import { AzureMetadataEntity } from "#src/models/azure/table/AzureMetadataEntity";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  declare messageRowKey: ReverseTickedTimestamp;
  declare rowKey: ReverseTickedTimestamp;
}
