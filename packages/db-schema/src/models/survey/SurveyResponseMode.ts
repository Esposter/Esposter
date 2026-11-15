import { z } from "zod";

export const SurveyResponseMode = {
  // Anyone with the link answers and no identity is carried
  Anonymous: "Anonymous",
  // Responses must present an opaque participant token issued by a Program
  Identified: "Identified",
} as const;
export type SurveyResponseMode = (typeof SurveyResponseMode)[keyof typeof SurveyResponseMode];

export const surveyResponseModeSchema = z.enum(SurveyResponseMode) satisfies z.ZodType<SurveyResponseMode>;
