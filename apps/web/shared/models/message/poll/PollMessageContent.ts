import type { PollOption } from "#shared/models/message/poll/PollOption";

import { pollOptionSchema } from "#shared/models/message/poll/PollOption";
import { createUniqueArraySchema, normalizeString } from "@esposter/shared";
import { z } from "zod";

export interface PollMessageContent {
  options: PollOption[];
  question: string;
  votes: Record<string, string>;
}

// No max on the question or an option label: a poll reaches the server as one serialized `message` body,
// Which `createMessage` already bounds by MESSAGE_MAX_LENGTH - a per-field cap here would bound nothing
// The whole-body cap does not, and would put a second number in the way of a long single-option poll
export const pollMessageContentSchema = z
  .object({
    options: createUniqueArraySchema(pollOptionSchema, "id").min(1),
    question: z.string().transform(normalizeString).pipe(z.string().min(1)),
    votes: z.record(z.string().min(1), z.string().min(1)),
  })
  .superRefine(({ options, votes }, ctx) => {
    const optionIds = new Set(options.map(({ id }) => id));
    for (const [userId, optionId] of Object.entries(votes))
      if (!optionIds.has(optionId))
        ctx.addIssue({ code: "custom", message: "Vote must reference an existing option", path: ["votes", userId] });
  }) satisfies z.ZodType<PollMessageContent>;
