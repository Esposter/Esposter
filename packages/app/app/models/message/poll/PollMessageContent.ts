import type { PollOption } from "@/models/message/poll/PollOption";

import { pollOptionSchema } from "@/models/message/poll/PollOption";
import { z } from "zod";

export interface PollMessageContent {
  options: PollOption[];
  question: string;
  votes: Record<string, string>;
}

export const pollMessageContentSchema = z
  .object({
    options: z.array(pollOptionSchema).min(1),
    question: z.string().min(1),
    votes: z.record(z.string().min(1), z.string().min(1)),
  })
  .superRefine((value, ctx) => {
    const optionIds = new Set(value.options.map(({ id }) => id));
    for (const [userId, optionId] of Object.entries(value.votes)) {
      if (!optionIds.has(optionId))
        ctx.addIssue({ code: "custom", message: "Vote must reference an existing option", path: ["votes", userId] });
    }
  }) satisfies z.ZodType<PollMessageContent>;
