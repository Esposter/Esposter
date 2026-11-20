import { pollMessageContentSchema } from "#src/models/message/poll/PollMessageContent";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS } from "#src/services/message/constants";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// A poll of `optionCount` options, with the least text every field needs to pass the schema's own checks
const createPoll = (optionCount: number) => ({
  options: Array.from({ length: optionCount }, () => ({ id: v7(), label: "a" })),
  question: "a",
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
