import { pollMessageContentSchema } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";

// The poll body with the actor's vote applied, or undefined when the body is not a poll the schema accepts or names no option
// Of its own. Only the votes change: the rest of the poll is written back as the schema reads it, which for a stored poll is
// The text it was stored as, since the schema wrote it
export const applyPollVote = (message: string, userId: string, optionId: string | undefined): string | undefined => {
  // oxlint-disable-next-line no-restricted-properties -- an option label is free text, and reviving an ISO-shaped one would turn it into a Date
  const body = getResult<unknown>(() => JSON.parse(message)).unwrapOr(undefined);
  const poll = pollMessageContentSchema.safeParse(body);
  if (!poll.success || (optionId !== undefined && !poll.data.options.some(({ id }) => id === optionId)))
    return undefined;

  const votes = { ...poll.data.votes };
  if (optionId === undefined) delete votes[userId];
  else votes[userId] = optionId;
  return JSON.stringify({ ...poll.data, votes });
};
