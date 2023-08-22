import type { CompositeKey } from "@/models/azure";
import type { TableClient } from "@azure/data-tables";

export enum AzureTable {
  Messages = "Messages",
  MessagesMetadata = "MessagesMetadata",
  Invites = "Invites",
  Surveys = "Surveys",
  PublishedSurveys = "PublishedSurveys",
}

// We just want to preserve the entity type when running getTableClient
// because the entity type should always be tied to the table 1-1
export type CustomTableClient<TEntity extends CompositeKey> = TableClient;
