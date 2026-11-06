import type { SurveySliderNode } from "#src/models/SurveySliderNode";
import type { z } from "zod";

import { createSurveyNumberAnswerSchema } from "#src/services/runner/answer/createSurveyNumberAnswerSchema";
import { SURVEY_INVALID_ANSWER_MESSAGE } from "#src/services/runner/constants";

// The gap a value may leave from a whole step, wide enough that a fraction of a step the float arithmetic cannot hold exactly still counts
const SURVEY_SLIDER_STEP_TOLERANCE = 1e-9;

// A slider's answer: a number inside its range that lands on a whole step from the range's minimum
export const createSurveySliderAnswerSchema = (node: SurveySliderNode): z.ZodType =>
  createSurveyNumberAnswerSchema({ max: node.props.max, min: node.props.min }).refine(
    (value) => {
      const steps = (value - node.props.min) / node.props.step;
      return Math.abs(steps - Math.round(steps)) < SURVEY_SLIDER_STEP_TOLERANCE;
    },
    { error: SURVEY_INVALID_ANSWER_MESSAGE },
  );
