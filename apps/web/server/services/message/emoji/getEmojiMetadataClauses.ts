import type { Clause } from "@esposter/azure";

import {
  MessageEmojiMetadataEntity,
  MessageEmojiMetadataEntityPropertyNames,
} from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { MessageMetadataType } from "@esposter/db-schema";
// The MessagesMetadata table holds every metadata type, so this is the "emoji rows of this room" predicate every
// Emoji query starts from
export const getEmojiMetadataClauses = (partitionKey: string): Clause<MessageEmojiMetadataEntity>[] => [
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey },
  { key: MessageEmojiMetadataEntityPropertyNames.type, operator: BinaryOperator.eq, value: MessageMetadataType.Emoji },
];
