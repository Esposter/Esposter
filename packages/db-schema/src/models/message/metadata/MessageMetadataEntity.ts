import type { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";
import type { ReverseTickedTimestamp } from "#src/models/message/ReverseTickedTimestamp";

import { CompositeKeyMetadataEntity } from "#src/models/message/metadata/CompositeKeyMetadataEntity";

export abstract class MessageMetadataEntity<
  TType extends MessageMetadataType,
> extends CompositeKeyMetadataEntity<TType> {
  declare messageRowKey: ReverseTickedTimestamp;
  declare rowKey: ReverseTickedTimestamp;
}
