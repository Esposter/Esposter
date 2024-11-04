import type { CompositeKey } from "@/models/azure";
import type { MessageEntity } from "@/models/esbabbler/message";
import type { MessageMetadataEntity } from "@/models/esbabbler/message/metadata";
import type { InviteEntity } from "@/models/esbabbler/room/invite";
import type { TableClient } from "@azure/data-tables";

export enum AzureTable {
  Invites = "Invites",
  Messages = "Messages",
  MessagesMetadata = "MessagesMetadata",
}

export interface AzureTableEntityMap {
  [AzureTable.Invites]: InviteEntity;
  [AzureTable.Messages]: MessageEntity;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity;
}

// We add a fake property to preserve the entity type when for the table client
// because the entity type should always be tied to the table 1-1
export type CustomTableClient<TEntity extends CompositeKey> = { entityType: TEntity } & TableClient;
