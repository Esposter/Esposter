import type { TupleSlice } from "@/utils/types";
import type { TableEntity, TransactionAction as AzureTransactionAction } from "@azure/data-tables";
import type { OmitIndexSignature } from "type-fest";
import { JsonObject, JsonProperty } from "typescript-json-serializer";

export enum AzureTable {
  Messages = "Messages",
}

export enum AzureContainer {
  Assets = "assets",
  ChatAssets = "chat-assets",
  AIChatbot = "ai-chatbot",
}

export type CompositeKey = OmitIndexSignature<TableEntity>;
// Write our own TransactionAction type to make it less restrictive when inserting records C:
// @NOTE: Remove this if/when microsoft team decides to make the type a little nicer to work with
type Distribute<T> = T extends unknown[] ? [T[0], CompositeKey | T[1], ...TupleSlice<T, 2>] : never;

export type TransactionAction = Distribute<AzureTransactionAction>;

@JsonObject()
export class MessageEntity {
  @JsonProperty() partitionKey!: string;
  @JsonProperty() rowKey!: string;
  @JsonProperty() creatorId!: string;
  @JsonProperty() message!: string;
  @JsonProperty() createdAt!: Date;
}
