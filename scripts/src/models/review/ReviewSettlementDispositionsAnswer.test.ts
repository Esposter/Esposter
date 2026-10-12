import { reviewSettlementDispositionsAnswerSchema } from "#src/models/review/ReviewSettlementDispositionsAnswer";
import { ReviewSettlementOutcome } from "#src/models/review/ReviewSettlementOutcome";
import { describe, expect, test } from "vitest";

describe(reviewSettlementDispositionsAnswerSchema, () => {
  const reason = "r";

  test("accepts fixed, refuted and recorded", () => {
    expect.hasAssertions();

    const dispositions = [
      { index: 0, outcome: ReviewSettlementOutcome.Fixed, reason },
      { index: 1, outcome: ReviewSettlementOutcome.Refuted, reason },
      { index: 2, outcome: ReviewSettlementOutcome.Recorded, reason },
    ];

    expect(reviewSettlementDispositionsAnswerSchema.parse({ dispositions })).toStrictEqual({ dispositions });
  });

  test("rejects a deferral, since a settler may not defer", () => {
    expect.hasAssertions();

    expect(
      reviewSettlementDispositionsAnswerSchema.safeParse({ dispositions: [{ index: 0, outcome: "deferred", reason }] })
        .success,
    ).toBe(false);
  });
});
