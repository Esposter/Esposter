import { reviewFindingsAnswerSchema } from "#src/models/review/ReviewFindingsAnswer";
import { ReviewLane } from "#src/models/review/ReviewLane";
import { parseReviewAnswer } from "#src/services/review/parseReviewAnswer";
import { describe, expect, test } from "vitest";

const FINDING = { file: "a.ts", line: 3, lane: ReviewLane.Correctness, summary: "wrong", trigger: "given 0" };

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

    expect(() => parseReviewAnswer('{"findings":[{"file":"a.ts"}]}', reviewFindingsAnswerSchema)).toThrowError(
      /does not parse/u,
    );
  });

  test("fails a session that answered with no object", () => {
    expect.hasAssertions();

    expect(() => parseReviewAnswer("no answer", reviewFindingsAnswerSchema)).toThrowError(/holds no JSON object/u);
  });
});
