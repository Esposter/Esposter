import { surveySchema, type Survey } from "@/models/surveyer/Survey";
import { z } from "zod";

export type SurveyerConfiguration = Survey[];

export const surveyerConfigurationSchema = z.array(surveySchema);
