import { TableEntity } from "@azure/data-tables";

export enum AzureTable {
  Messages = "Messages",
}

export enum AzureBlob {
  Assets = "assets",
}

export enum AzureQueue {
  AIChatbotPendingMessageReplies = "AIChatbotPendingMessageReplies",
}

export interface AzureMessageEntity extends TableEntity {
  userId: string;
  message: string;
  createdAt: string;
}

export interface MessageEntity extends TableEntity {
  userId: string;
  message: string;
  createdAt: Date;
}
