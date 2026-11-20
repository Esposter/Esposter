import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS } from "#shared/services/message/constants";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("pollMessageContentSchema", () => {
  const createPoll = (optionCount: number) => ({
    options: Array.from({ length: optionCount }, (_, index) => ({ id: v7(), label: `Option ${index}` })),
    question: "Which one?",
    votes: {},
  });

  test.each([
    { expected: true, optionCount: POLL_MIN_OPTIONS, title: "accepts the fewest options a poll can offer" },
    { expected: true, optionCount: POLL_MAX_OPTIONS, title: "accepts the most options a poll can offer" },
    { expected: false, optionCount: POLL_MIN_OPTIONS - 1, title: "refuses a poll with fewer options than the minimum" },
    { expected: false, optionCount: POLL_MAX_OPTIONS + 1, title: "refuses a poll with more options than the maximum" },
  ])("$title", ({ expected, optionCount }) => {
    expect(pollMessageContentSchema.safeParse(createPoll(optionCount)).success).toBe(expected);
  });
});
