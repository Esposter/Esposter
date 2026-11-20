import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS } from "#shared/services/message/constants";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const createPoll = (optionCount: number) => ({
  options: Array.from({ length: optionCount }, (_value, index) => ({ id: v7(), label: `Option ${index}` })),
  question: "Which one?",
  votes: {},
});

describe("pollMessageContentSchema", () => {
  test.each([
    { expected: true, optionCount: POLL_MIN_OPTIONS, title: "accepts the fewest options a poll can offer" },
    { expected: true, optionCount: POLL_MAX_OPTIONS, title: "accepts the most options a poll can offer" },
    { expected: false, optionCount: POLL_MIN_OPTIONS - 1, title: "refuses a poll with fewer options than the minimum" },
    { expected: false, optionCount: POLL_MAX_OPTIONS + 1, title: "refuses a poll with more options than the maximum" },
  ])("$title", ({ expected, optionCount }) => {
    expect.hasAssertions();

    expect(pollMessageContentSchema.safeParse(createPoll(optionCount)).success).toBe(expected);
  });
});
