import type { PollOption } from "@/models/message/poll/PollOption";

import { pollOptionSchema } from "@/models/message/poll/PollOption";
import { z } from "zod";

export interface PollMessageContent {
  options: PollOption[];
  question: string;
  votes: Record<string, string>;
}

export const pollMessageContentSchema = z.object({
  options: z.array(pollOptionSchema).min(1),
  question: z.string().min(1),
  votes: z.record(z.string().min(1), z.string().min(1)),
}) satisfies z.ZodType<PollMessageContent>;
