import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";

import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { THEME_KEY } from "@/services/survey/constants";
import { getSurveySummaryCards } from "@/services/survey/summary/getSurveySummaryCards";
import { Model } from "survey-core";

// The summary's cards, one per question with a response column. The questions come from the survey's own model, so
// Their kinds and choice labels are the respondent's; the theme is how the survey looks, not a question, so it is dropped
export const getSurveyResponseSummaryCards = (model: string, { columns, rows }: SurveyResponseRecords) => {
  const { [THEME_KEY]: _theme, ...surveyModel } = parseSurveyModel(model);
  const columnNames = new Set(columns.map(({ name }) => name));
  const questions = new Model(surveyModel).getAllQuestions().filter(({ name }) => columnNames.has(name));
  return getSurveySummaryCards(questions, rows);
};
