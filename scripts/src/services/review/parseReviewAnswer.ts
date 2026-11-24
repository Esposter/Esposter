import type { z } from "zod";

import { claudeOutputSchema } from "#src/models/review/ClaudeOutput";
import { REVIEW_ANSWER_TAIL_CHARACTER_LIMIT } from "#src/services/review/constants";
import { getLastJsonObject } from "#src/services/review/getLastJsonObject";
import { getResult, InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

// A session's printed output, validated: the envelope `claude -p --output-format json` wraps its text in is opened when
// It is one, and the answer is the last top-level object of that text, parsed against the schema. An answer that fails
// The parse fails that session.
export const parseReviewAnswer = <T>(output: string, schema: z.ZodType<T>): T => {
  const text = getResult(() => claudeOutputSchema.parse(jsonDateParse(output))).match(
    ({ result }) => result,
    () => output,
  );
  const answer = getLastJsonObject(text);
  if (answer === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      "review answer",
      `it holds no JSON object, and its text ends: ${JSON.stringify(text.slice(-REVIEW_ANSWER_TAIL_CHARACTER_LIMIT))}`,
    );

  return getResult(() => schema.parse(jsonDateParse(answer))).match(
    (value) => value,
    (error) => {
      throw new InvalidOperationError(Operation.Read, "review answer", `it does not parse: ${error.message}`);
    },
  );
};
