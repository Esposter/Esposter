import type { PollOption } from "@/models/message/poll/PollOption";

import { pollOptionSchema } from "@/models/message/poll/PollOption";
import { z } from "zod";

export interface PollMessageContent {
  options: PollOption[];
  question: string;
  votes: Record<string, string>;
}

export const pollMessageContentSchema = z.object({
  options: z.array(pollOptionSchema),
  question: z.string(),
  votes: z.record(z.string(), z.string()),
}) satisfies z.ZodType<PollMessageContent>;
