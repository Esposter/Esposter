import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { Resource } from "@esposter/db-schema";

import { readSurveyResponseDatasetSource } from "@@/server/services/dataset/surveyResponses/readSurveyResponseDatasetSource";
import { toSurveyResponseDatasetRow } from "@@/server/services/dataset/surveyResponses/toSurveyResponseDatasetRow";

// The Responses blade's read: the same rows the dataset serves, each already carrying the key its
// Detail and delete actions need — so the blade never has to match two lists up by index
export const readSurveyResponseRecords = async (surveyId: Resource["id"]): Promise<SurveyResponseRecords> => {
  const { columns, surveyResponses } = await readSurveyResponseDatasetSource(surveyId);
  return {
    columns,
    // The row is built fresh per response and shared with nobody, so the key is assigned onto it rather
    // Than spread into a second copy
    rows: surveyResponses.map(({ model, rowKey }) =>
      Object.assign(toSurveyResponseDatasetRow(columns, model), { rowKey }),
    ),
  };
};
