import type { SurveyKeyedChoice } from "@/models/resource/survey/SurveyKeyedChoice";
import type { SurveyChoice } from "vue-survey-engine-headless";

// Each choice keyed by its place in the question, since two values may read alike and a list keys its rows by text
export const getSurveyKeyedChoices = <TChoice extends SurveyChoice>(choices: TChoice[]): SurveyKeyedChoice<TChoice>[] =>
  choices.map((choice, index) => ({ choice, key: String(index) }));
