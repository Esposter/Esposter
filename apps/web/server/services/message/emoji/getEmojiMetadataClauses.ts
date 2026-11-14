import type { Clause, MessageEmojiMetadataEntity } from "@esposter/db-schema";
import {
  BinaryOperator,
  CompositeKeyPropertyNames,
  MessageEmojiMetadataEntityPropertyNames,
  MessageMetadataType,
} from "@esposter/db-schema";

// The MessagesMetadata table holds every metadata type, so this is the "emoji rows of this room" predicate every
// Emoji query starts from
export const getEmojiMetadataClauses = (partitionKey: string): Clause<MessageEmojiMetadataEntity>[] => [
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: partitionKey },
  { key: MessageEmojiMetadataEntityPropertyNames.type, operator: BinaryOperator.Eq, value: MessageMetadataType.Emoji },
];
