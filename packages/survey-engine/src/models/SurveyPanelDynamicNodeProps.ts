import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { SurveyTemplateNode } from "#src/models/SurveyTemplateNode";

import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The most panels a dynamic panel may hold, the bound every panel count is held to
const MAX_SURVEY_PANEL_COUNT = 20;

// The props of a dynamic panel question: a template of questions, drawn once for each panel a respondent adds
export interface SurveyPanelDynamicNodeProps extends SurveyQuestionBaseProps {
  addPanelText: string;
  maxPanelCount: number;
  minPanelCount: number;
  panelCount: number;
  removePanelText: string;
  template: SurveyTemplateNode[];
}

// The own props, without the template slot, which the node schema adds beside the id
export const surveyPanelDynamicNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    addPanelText: z.ZodDefault<z.ZodString>;
    maxPanelCount: z.ZodDefault<z.ZodInt>;
    minPanelCount: z.ZodDefault<z.ZodInt>;
    panelCount: z.ZodDefault<z.ZodInt>;
    removePanelText: z.ZodDefault<z.ZodString>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  addPanelText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  maxPanelCount: z.int().min(1).max(MAX_SURVEY_PANEL_COUNT).default(MAX_SURVEY_PANEL_COUNT),
  minPanelCount: z.int().min(0).max(MAX_SURVEY_PANEL_COUNT).default(0),
  panelCount: z.int().min(0).max(MAX_SURVEY_PANEL_COUNT).default(1),
  removePanelText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
});
