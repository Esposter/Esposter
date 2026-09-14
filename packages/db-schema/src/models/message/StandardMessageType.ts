import { MessageType, MessageTypes } from "#src/models/message/MessageType";
import { z } from "zod";

export type StandardMessageType = Exclude<MessageType, MessageType.Webhook>;

export const standardMessageTypeSchema = z.enum(
  MessageTypes.filter((type) => type !== MessageType.Webhook),
) satisfies z.ZodType<StandardMessageType>;
