import { z } from "zod";

export enum SurveyResponseMode {
  // Anyone with the link answers and no identity is carried
  Anonymous = "Anonymous",
  // Responses must present an opaque participant token issued by a Program
  Identified = "Identified",
}

export const surveyResponseModeSchema = z.enum(SurveyResponseMode) satisfies z.ZodType<SurveyResponseMode>;

export const SurveyResponseModes = Object.values(SurveyResponseMode);
