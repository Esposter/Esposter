import { z } from "zod";

export enum MessageType {
  EditRoom = "EditRoom",
  Message = "Message",
  PinMessage = "PinMessage",
  Webhook = "Webhook",
}

export type StandardMessageType = Exclude<MessageType, MessageType.Webhook>;

export const standardMessageTypeSchema = z.enum(
  Object.values(MessageType).filter((type) => type !== MessageType.Webhook),
);
