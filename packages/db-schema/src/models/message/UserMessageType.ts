import { MessageType } from "#src/models/message/MessageType";
import { z } from "zod";

// The types a member may post. Every other standard type is a line the server writes on the room's behalf — a system
// Notice, a call, a pin, a rename — and its renderer draws it as the room's own voice, so a member able to post one
// Could put words in the room's mouth
export type UserMessageType = MessageType.Message | MessageType.Poll;

export const userMessageTypeSchema = z.enum([
  MessageType.Message,
  MessageType.Poll,
]) satisfies z.ZodType<UserMessageType>;
