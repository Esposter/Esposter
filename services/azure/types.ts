import type { TableEntity, TransactionAction as AzureTransactionAction } from "@azure/data-tables";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import type { RemoveIndexSignature, TupleSlice } from "@/util/types";

export enum AzureTable {
  Messages = "Messages",
}

export enum AzureContainer {
  Assets = "assets",
  AIChatbot = "ai-chatbot",
}

export type CompositeKey = RemoveIndexSignature<TableEntity>;
// Write our own transaction action type to make it less restrictive when inserting records C:
type Distribute<T> = T extends unknown[] ? [T[0], CompositeKey | T[1], ...TupleSlice<T, 2>] : never;

export type TransactionAction = Distribute<AzureTransactionAction>;

export interface AzureMessageEntity extends TableEntity {
  userId: string;
  message: string;
  createdAt: Date;
}

@JsonObject()
export class MessageEntity implements RemoveIndexSignature<AzureMessageEntity> {
  @JsonProperty() partitionKey!: string;
  @JsonProperty() rowKey!: string;
  @JsonProperty() userId!: string;
  @JsonProperty() message!: string;
  @JsonProperty() createdAt!: Date;
}
