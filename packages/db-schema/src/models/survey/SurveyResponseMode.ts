import { z } from "zod";

export enum SurveyResponseMode {
  // Anyone with the link answers and no identity is carried
  Anonymous = "Anonymous",
  // Responses must present an opaque invite token issued by a Program
  Invited = "Invited",
}

export const surveyResponseModeSchema = z.enum(SurveyResponseMode) satisfies z.ZodType<SurveyResponseMode>;

export const SurveyResponseModes = Object.values(SurveyResponseMode);
