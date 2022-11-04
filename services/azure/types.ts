import { JsonObject, JsonProperty } from "typescript-json-serializer";

export enum AzureTable {
  Messages = "Messages",
}

export enum AzureContainer {
  Assets = "assets",
  AIChatbot = "ai-chatbot",
}

export interface CompositeKey {
  partitionKey: string;
  rowKey: string;
}

interface IMessageEntity extends CompositeKey {
  userId: string;
  message: string;
  createdAt: Date;
}

@JsonObject()
export class MessageEntity implements IMessageEntity {
  @JsonProperty() partitionKey!: string;
  @JsonProperty() rowKey!: string;
  @JsonProperty() userId!: string;
  @JsonProperty() message!: string;
  @JsonProperty() createdAt!: Date;
}
