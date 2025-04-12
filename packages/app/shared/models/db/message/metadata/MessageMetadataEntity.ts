import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";

import { AzureMetadataEntity, createAzureMetadataEntitySchema } from "#shared/models/azure/AzureMetadataEntity";
import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { type } from "arktype";

export abstract class MessageMetadataEntity<TType extends MessageMetadataType> extends AzureMetadataEntity<TType> {
  messageRowKey!: string;
}

export const createMessageMetadataEntitySchema = <TType extends string>(typeSchema: type.Any<TType>) =>
  createAzureMetadataEntitySchema(
    type({
      partitionKey: messageEntitySchema.get("partitionKey"),
      rowKey: "string",
    }),
    typeSchema,
  ).merge(
    type({
      messageRowKey: messageEntitySchema.get("rowKey"),
    }),
  );
