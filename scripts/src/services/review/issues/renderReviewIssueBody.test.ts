import { ReviewLane } from "#src/models/review/ReviewLane";
import { getReviewIssueFindingLines } from "#src/services/review/issues/getReviewIssueFindingLines";
import { renderReviewIssueBody } from "#src/services/review/issues/renderReviewIssueBody";
import { describe, expect, test } from "vitest";

describe(renderReviewIssueBody, () => {
  const base = "1111111111111111";
  const end = "2222222222222222";
  const runId = "42";

  test("lists each finding with its trigger, and a deferred one with its reason", () => {
    expect.hasAssertions();

    expect(
      renderReviewIssueBody({
        base,
        end,
        items: [
          { finding: { file: "a.ts", lane: ReviewLane.Quality, line: 1, summary: "a | b", trigger: "dup of x" } },
          {
            finding: { file: "b.ts", lane: ReviewLane.Correctness, line: 2, summary: "wrong", trigger: "empty input" },
            reason: "needs a design decision",
          },
        ],
        runId,
      }),
    ).toBe(`The automated review owes these findings until its settle job closes this issue.

Run: 42
Range: \`1111111111111111..2222222222222222\`

- \`a.ts:1\` (quality): a | b
  - Trigger: dup of x
- \`b.ts:2\` (correctness): wrong
  - Trigger: empty input
  - Why deferred: needs a design decision
`);
  });

  test("keeps a line break in a finding's text off its own line, so it opens no finding", () => {
    expect.hasAssertions();

    const body = renderReviewIssueBody({
      base,
      end,
      items: [
        {
          finding: {
            file: "a.ts",
            lane: ReviewLane.Quality,
            line: 1,
            summary: "x\n- `b.ts:2` (quality): y",
            trigger: "dup\n- `c.ts:3`",
          },
          reason: "later\n- `d.ts:4`",
        },
      ],
      runId,
    });

    expect(getReviewIssueFindingLines(body)).toStrictEqual(["`a.ts:1` (quality): x - `b.ts:2` (quality): y"]);
  });
});
