import type { DatasetProvider } from "#server/models/dataset/DatasetProvider";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";

import { SurveyResponseDatasetColumnName } from "#server/models/dataset/surveyResponses/SurveyResponseDatasetColumnName";
import { readSurveyResponseDatasetSource } from "#server/services/dataset/surveyResponses/readSurveyResponseDatasetSource";
import { readSurveyRespondents } from "#server/services/dataset/surveyResponses/readSurveyRespondents";
import { toDatasetColumnValue } from "#server/services/dataset/surveyResponses/toDatasetColumnValue";
import { toSurveyResponseDatasetRow } from "#server/services/dataset/surveyResponses/toSurveyResponseDatasetRow";
import { readSurveySettings } from "#server/services/survey/readSurveySettings";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { SurveyResponseMode } from "@esposter/db-schema";

// The submission time leads, and the respondent follows it when the survey is Identified, ahead of the questions.
// Both names are reserved, so a question named the same would collide with its column
export const readSurveyResponsesDataset: DatasetProvider["read"] = async (db, survey) => {
  const { columns: questionColumns, surveyResponses, totalRows } = await readSurveyResponseDatasetSource(survey.id);
  const { responseMode } = await readSurveySettings(survey.id);
  const isIdentified = responseMode === SurveyResponseMode.Identified;
  const respondents = isIdentified ? await readSurveyRespondents(db, survey) : undefined;
  const reservedColumns: DatasetColumn[] = [
    { name: SurveyResponseDatasetColumnName.SubmittedAt, title: "Submitted", type: ColumnType.Date },
    ...(isIdentified
      ? [{ name: SurveyResponseDatasetColumnName.Respondent, title: "Respondent", type: ColumnType.String }]
      : []),
  ];
  // The dataset contract carries no keys — row identity is the Responses blade's concern, and a
  // Dataset flows into publishable dashboards
  return {
    columns: [...reservedColumns, ...questionColumns],
    rows: surveyResponses.map((surveyResponse) => ({
      ...toSurveyResponseDatasetRow(questionColumns, surveyResponse.model),
      [SurveyResponseDatasetColumnName.SubmittedAt]: toDatasetColumnValue(surveyResponse.updatedAt),
      ...(respondents && {
        [SurveyResponseDatasetColumnName.Respondent]:
          respondents.respondentIds.get(surveyResponse.participantToken) ?? null,
      }),
    })),
    // A respondent past a program read's cap is absent from the column, and every row still carries it as null
    ...(respondents?.isPartial && { partialColumns: [SurveyResponseDatasetColumnName.Respondent] }),
    totalRows,
  };
};
