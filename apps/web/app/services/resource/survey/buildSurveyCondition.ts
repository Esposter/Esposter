import type { SurveyConditionJoin } from "@/models/resource/survey/SurveyConditionJoin";
import type { SurveyConditionRow } from "@/models/resource/survey/SurveyConditionRow";

import { buildSurveyConditionRow } from "@/services/resource/survey/buildSurveyConditionRow";

// The expression the rows write, each joined to the next by the one connective. A row with no question is not yet a
// Condition, so it is skipped rather than written
export const buildSurveyCondition = (rows: readonly SurveyConditionRow[], join: SurveyConditionJoin): string =>
  rows
    .filter(({ questionName }) => questionName !== "")
    .map((row) => buildSurveyConditionRow(row))
    .join(` ${join} `);
