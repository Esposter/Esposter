import type { SurveyConditionJoin } from "#src/models/resource/survey/SurveyConditionJoin";
import type { SurveyConditionRow } from "#src/models/resource/survey/SurveyConditionRow";

// A condition read back as its rows, with the one connective every row is joined by
export interface SurveyConditionRows {
  join: SurveyConditionJoin;
  rows: SurveyConditionRow[];
}
