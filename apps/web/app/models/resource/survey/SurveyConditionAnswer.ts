import type { SurveyNodeType } from "survey-engine";

// An answer a condition may read, a question that holds one or a calculated value, by its name and shown by its title
export interface SurveyConditionAnswer {
  name: string;
  title: string;
  type: SurveyNodeType;
}
