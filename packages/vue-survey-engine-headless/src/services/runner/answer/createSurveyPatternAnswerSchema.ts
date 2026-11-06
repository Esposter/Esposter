import type { z } from "zod";

import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";
import { getResult } from "@esposter/shared";
import { RE2JS } from "re2js";

// A text answer must match its question's pattern. The pattern runs on RE2, whose matching takes time linear in the answer
// So no pattern stalls the check. A pattern RE2 cannot compile is ignored, since it would fail every answer rather than one
export const createSurveyPatternAnswerSchema = (schema: z.ZodType<string>, pattern: string): z.ZodType<string> =>
  getResult(() => RE2JS.compile(pattern, RE2JS.LOOKBEHINDS))
    .map((regex) => schema.refine((value) => regex.matcher(value).find(), { error: SURVEY_INVALID_ANSWER_MESSAGE }))
    .unwrapOr(schema);
