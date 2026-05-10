import { MessageType } from "@esposter/db-schema";

export const PinnableMessageTypes = new Set([MessageType.Message, MessageType.Poll, MessageType.Webhook]);
