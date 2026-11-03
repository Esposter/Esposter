import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { SurveySummaryCard } from "@/models/resource/survey/SurveySummaryCard";
import type { SurveyDocument } from "survey-engine";

import { getSurveyDocumentQuestions } from "#shared/services/survey/getSurveyDocumentQuestions";
import { getSurveyDocumentSummaryCards } from "@/services/survey/summary/getSurveyDocumentSummaryCards";

// The summary's cards for the questions the responses hold a column for, so a question with no column has no card
export const getSurveyDocumentResponseSummaryCards = (
  document: SurveyDocument,
  { columns, rows }: SurveyResponseRecords,
): SurveySummaryCard[] => {
  const columnNames = new Set(columns.map(({ name }) => name));
  const questions = getSurveyDocumentQuestions(document).filter(({ props }) => columnNames.has(props.name));
  return getSurveyDocumentSummaryCards(questions, rows);
};
