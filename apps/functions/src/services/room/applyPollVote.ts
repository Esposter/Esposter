import { getResult, jsonDateParse } from "@esposter/shared";

interface PollBody {
  options: { id: string }[];
  votes: Record<string, string>;
}

const isPollBody = (value: unknown): value is PollBody =>
  typeof value === "object" &&
  value !== null &&
  "options" in value &&
  Array.isArray(value.options) &&
  "votes" in value &&
  typeof value.votes === "object" &&
  value.votes !== null;

// The poll body with the actor's vote applied, or undefined when the body is not a poll or names no option of its own.
// Only the votes change: every other field of the poll is written back exactly as it was read
export const applyPollVote = (message: string, userId: string, optionId: string | undefined): string | undefined => {
  const body = getResult(() => jsonDateParse<unknown>(message)).unwrapOr(undefined);
  if (!isPollBody(body) || (optionId !== undefined && !body.options.some(({ id }) => id === optionId)))
    return undefined;

  const votes = { ...body.votes };
  if (optionId === undefined) delete votes[userId];
  else votes[userId] = optionId;
  return JSON.stringify({ ...body, votes });
};
