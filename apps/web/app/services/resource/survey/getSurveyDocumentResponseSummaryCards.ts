import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { SurveySummaryCard } from "@/models/resource/survey/SurveySummaryCard";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { getSurveyDocumentSummaryCards } from "@/services/survey/summary/getSurveyDocumentSummaryCards";
import { flattenSurveyQuestions } from "vue-survey-engine-headless";

// The summary's cards for the questions the responses hold a column for, so a question with no column has no card
export const getSurveyDocumentResponseSummaryCards = (
  document: SurveyDocument,
  { columns, rows }: SurveyResponseRecords,
): SurveySummaryCard[] => {
  const columnNames = new Set(columns.map(({ name }) => name));
  const questions = flattenSurveyQuestions(document.content).filter(({ props }) => columnNames.has(props.name));
  return getSurveyDocumentSummaryCards(questions, rows);
};
