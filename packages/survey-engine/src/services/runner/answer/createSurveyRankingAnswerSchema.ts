import type { SurveyRankingNode } from "#src/models/SurveyRankingNode";
import type { z } from "zod";

import { createSurveySelectionAnswerSchema } from "#src/services/runner/answer/createSurveySelectionAnswerSchema";

// A ranking's answer: its choices in the order a respondent put them
// Distinct choices cannot make a list longer than the choices themselves, so the list needs no bound of its own
export const createSurveyRankingAnswerSchema = (node: SurveyRankingNode): z.ZodType =>
  createSurveySelectionAnswerSchema({ choices: node.props.choices });
