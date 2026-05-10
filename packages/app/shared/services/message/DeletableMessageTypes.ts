import { MessageType } from "@esposter/db-schema";

export const DeletableMessageTypes = new Set([MessageType.Message, MessageType.Poll, MessageType.Webhook]);
