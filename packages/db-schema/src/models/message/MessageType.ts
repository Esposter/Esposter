import { z } from "zod";

export enum MessageType {
  EditRoom = "EditRoom",
  Message = "Message",
  PinMessage = "PinMessage",
  Webhook = "Webhook",
}

export const MessageTypes: ReadonlySet<MessageType> = new Set(Object.values(MessageType));

export type StandardMessageType = Exclude<MessageType, MessageType.Webhook>;

export const standardMessageTypeSchema = z.enum(
  [...MessageTypes].filter((type) => type !== MessageType.Webhook),
) satisfies z.ZodType<StandardMessageType>;
