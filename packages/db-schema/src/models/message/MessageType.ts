import { z } from "zod";

export enum MessageType {
  EditRoom = "EditRoom",
  Message = "Message",
  PinMessage = "PinMessage",
  Webhook = "Webhook",
}

export const standardMessageTypeSchema = z.enum(
  Object.values(MessageType).filter((type) => type !== MessageType.Webhook),
);
