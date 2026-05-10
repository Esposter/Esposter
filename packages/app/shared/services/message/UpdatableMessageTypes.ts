import { MessageType } from "@esposter/db-schema";

export const UpdatableMessageTypes = new Set([MessageType.Message, MessageType.Webhook]);
