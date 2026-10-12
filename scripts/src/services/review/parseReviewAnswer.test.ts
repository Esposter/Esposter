import { reviewFindingsAnswerSchema } from "#src/models/review/ReviewFindingsAnswer";
import { ReviewLane } from "#src/models/review/ReviewLane";
import { parseReviewAnswer } from "#src/services/review/parseReviewAnswer";
import { describe, expect, test } from "vitest";

const FINDING = { file: "a.ts", lane: ReviewLane.Correctness, line: 3, summary: "wrong", trigger: "given 0" };

describe(parseReviewAnswer, () => {
  test("reads the answer out of the envelope's result", () => {
    expect.hasAssertions();

    const answer = JSON.stringify({ findings: [FINDING] });
    const output = JSON.stringify({ result: `I read the diff.\n${answer}`, type: "result" });

    expect(parseReviewAnswer(output, reviewFindingsAnswerSchema)).toStrictEqual({ findings: [FINDING] });
  });

  test("reads an answer printed without an envelope", () => {
    expect.hasAssertions();

    expect(parseReviewAnswer(JSON.stringify({ findings: [] }), reviewFindingsAnswerSchema)).toStrictEqual({
      findings: [],
    });
  });

  test("fails a session whose answer does not match the schema", () => {
    expect.hasAssertions();

    expect(() => parseReviewAnswer('{"findings":[{"file":"a.ts"}]}', reviewFindingsAnswerSchema))
      .toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: review answer, it does not parse: [
        {
          "code": "invalid_value",
          "values": [
            "correctness",
            "quality"
          ],
          "path": [
            "findings",
            0,
            "lane"
          ],
          "message": "Invalid option: expected one of \\"correctness\\"|\\"quality\\""
        },
        {
          "expected": "number",
          "code": "invalid_type",
          "path": [
            "findings",
            0,
            "line"
          ],
          "message": "Invalid input: expected number, received undefined"
        },
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [
            "findings",
            0,
            "summary"
          ],
          "message": "Invalid input: expected string, received undefined"
        },
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [
            "findings",
            0,
            "trigger"
          ],
          "message": "Invalid input: expected string, received undefined"
        }
      ]]
    `);
  });

  test("fails a session that answered with no object", () => {
    expect.hasAssertions();

    expect(() => parseReviewAnswer("no answer", reviewFindingsAnswerSchema)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: review answer, it holds no JSON object]`,
    );
  });
});
