import { applyPollVote } from "#src/services/room/applyPollVote";
import { jsonDateParse } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(applyPollVote, () => {
  test("refuses a poll body the schema rejects, here one with no question", () => {
    expect.hasAssertions();

    const optionId = v7();
    const message = JSON.stringify({
      options: [
        { id: optionId, label: "a" },
        { id: v7(), label: "a" },
      ],
      votes: {},
    });

    expect(applyPollVote(message, v7(), optionId)).toBeUndefined();
  });

  test("keeps the stored question text, which the schema would trim, when it writes the vote back", () => {
    expect.hasAssertions();

    const optionId = v7();
    const message = JSON.stringify({
      options: [
        { id: optionId, label: "a" },
        { id: v7(), label: "b" },
      ],
      question: " question ",
      votes: {},
    });

    const result = applyPollVote(message, v7(), optionId);

    expect(jsonDateParse(result ?? "null")).toHaveProperty("question", " question ");
  });
});
