import { z } from "zod";

// The SDK message an event came from, which is what a fork or a rewind names as its point in the conversation
export interface MessageUuid {
  messageUuid: string;
}

export const messageUuidSchema: z.ZodObject<{ messageUuid: z.ZodString }> = z.object({
  messageUuid: z.string(),
}) satisfies z.ZodType<MessageUuid>;
