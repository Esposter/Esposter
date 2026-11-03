import type { SurveyChoice } from "#src/models/SurveyChoice";

// The text a respondent reads for a choice: its own text, or its value when it has none
export const getSurveyChoiceText = ({ text, value }: SurveyChoice): string => text || String(value);
