import type { CompositeKey } from "@/models/azure";
import type { MessageEntity } from "@/models/esbabbler/message";
import type { MessageMetadataEntity } from "@/models/esbabbler/message/metadata";
import type { InviteEntity } from "@/models/esbabbler/room/invite";
import type { SurveyEntity } from "@/models/surveyer/SurveyEntity";
import type { TableClient } from "@azure/data-tables";

export enum AzureTable {
  Invites = "Invites",
  Messages = "Messages",
  MessagesMetadata = "MessagesMetadata",
  PublishedSurveys = "PublishedSurveys",
}

export type AzureTableEntityMap = {
  [AzureTable.Invites]: InviteEntity;
  [AzureTable.Messages]: MessageEntity;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity;
  [AzureTable.PublishedSurveys]: SurveyEntity;
};

// We add a fake property to preserve the entity type when running getTableClient
// because the entity type should always be tied to the table 1-1
export type CustomTableClient<TEntity extends CompositeKey> = TableClient & { entityType: TEntity };
