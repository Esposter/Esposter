import type { z } from "zod";

import { claudeOutputSchema } from "#src/models/review/ClaudeOutput";
import { getLastJsonObject } from "#src/services/review/getLastJsonObject";
import { getResult } from "@esposter/shared";

// A session's printed output, validated: the envelope `claude -p --output-format json` wraps its text in is opened when
// it is one, and the answer is the last top-level object of that text, parsed against the schema. An answer that fails
// the parse fails that session.
export const parseReviewAnswer = <T>(output: string, schema: z.ZodType<T>): T => {
  const text = getResult(() => claudeOutputSchema.parse(JSON.parse(output))).match(
    ({ result }) => result,
    () => output,
  );
  const answer = getLastJsonObject(text);
  if (answer === undefined) throw new Error("the session's answer holds no JSON object");

  return getResult(() => schema.parse(JSON.parse(answer))).match(
    (value) => value,
    (error) => {
      throw new Error(`the session's answer does not parse: ${error.message}`, { cause: error });
    },
  );
};
