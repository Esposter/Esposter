import { createPollMessageContent } from "#shared/models/message/poll/createPollMessageContent.test";
import { pollMessageContentSchema } from "#shared/models/message/poll/PollMessageContent";
import { POLL_MAX_OPTIONS, POLL_MIN_OPTIONS } from "#shared/services/message/constants";
import { describe, expect, test } from "vitest";

describe("pollMessageContentSchema", () => {
  test.each([
    { expected: true, optionCount: POLL_MIN_OPTIONS, title: "accepts the fewest options a poll can offer" },
    { expected: true, optionCount: POLL_MAX_OPTIONS, title: "accepts the most options a poll can offer" },
    { expected: false, optionCount: POLL_MIN_OPTIONS - 1, title: "refuses a poll with fewer options than the minimum" },
    { expected: false, optionCount: POLL_MAX_OPTIONS + 1, title: "refuses a poll with more options than the maximum" },
  ])("$title", ({ expected, optionCount }) => {
    expect.hasAssertions();

    expect(pollMessageContentSchema.safeParse(createPollMessageContent(optionCount)).success).toBe(expected);
  });
});
