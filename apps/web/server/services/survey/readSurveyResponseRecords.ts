import type { Context } from "#server/trpc/context";
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { ResourceInResource } from "@esposter/db-schema";

import { readSurveyResponseDatasetSource } from "#server/services/dataset/surveyResponses/readSurveyResponseDatasetSource";
import { toSurveyResponseDatasetRow } from "#server/services/dataset/surveyResponses/toSurveyResponseDatasetRow";

// The Responses blade's read: the same rows the dataset serves, each already carrying the response id its
// Detail and delete actions need — so the blade never has to match two lists up by index
export const readSurveyResponseRecords = async (
  db: Context["db"],
  surveyId: ResourceInResource["id"],
): Promise<SurveyResponseRecords> => {
  const { columns, surveyResponses, totalRows } = await readSurveyResponseDatasetSource(db, surveyId);
  return {
    columns,
    // The row is built fresh per response and shared with nobody, so the id is assigned onto it rather
    // Than spread into a second copy
    rows: surveyResponses.map(({ id, model }) =>
      Object.assign(toSurveyResponseDatasetRow(columns, model), { responseId: id }),
    ),
    totalRows,
  };
};
