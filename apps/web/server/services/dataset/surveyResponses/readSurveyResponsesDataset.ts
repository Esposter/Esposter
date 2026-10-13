import type { DatasetProvider } from "#server/models/dataset/DatasetProvider";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";

import { SurveyResponseDatasetColumnName } from "#server/models/dataset/surveyResponses/SurveyResponseDatasetColumnName";
import { readSurveyRespondents } from "#server/services/dataset/surveyResponses/readSurveyRespondents";
import { readSurveyResponseDatasetSource } from "#server/services/dataset/surveyResponses/readSurveyResponseDatasetSource";
import { toDatasetColumnValue } from "#server/services/dataset/surveyResponses/toDatasetColumnValue";
import { toSurveyResponseDatasetRow } from "#server/services/dataset/surveyResponses/toSurveyResponseDatasetRow";
import { readSurveySettings } from "#server/services/survey/readSurveySettings";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { SurveyResponseMode } from "@esposter/db-schema";

// A question can take either name, so a reserved column that collides with one takes a suffix no question has
const reserveColumnName = (name: string, questionNames: Set<string>) => {
  let reservedName = name;
  while (questionNames.has(reservedName)) reservedName += "_";
  return reservedName;
};

// The submission time leads, and the respondent follows it when the survey is Identified, ahead of the questions
export const readSurveyResponsesDataset: DatasetProvider["read"] = async (db, survey) => {
  const { columns: questionColumns, surveyResponses, totalRows } = await readSurveyResponseDatasetSource(survey.id);
  const { responseMode } = await readSurveySettings(survey.id);
  const isIdentified = responseMode === SurveyResponseMode.Identified;
  const respondents = isIdentified ? await readSurveyRespondents(db, survey) : undefined;
  const questionNames = new Set(questionColumns.map(({ name }) => name));
  const submittedAtName = reserveColumnName(SurveyResponseDatasetColumnName.SubmittedAt, questionNames);
  const respondentName = reserveColumnName(SurveyResponseDatasetColumnName.Respondent, questionNames);
  const submittedColumn: DatasetColumn = { name: submittedAtName, title: "Submitted", type: ColumnType.Date };
  const respondentColumn: DatasetColumn = { name: respondentName, title: "Respondent", type: ColumnType.String };
  // The dataset contract carries no keys — row identity is the Responses blade's concern, and a
  // Dataset flows into publishable dashboards
  return {
    columns: [submittedColumn, ...(isIdentified ? [respondentColumn] : []), ...questionColumns],
    rows: surveyResponses.map((surveyResponse) => {
      const row = toSurveyResponseDatasetRow(questionColumns, surveyResponse.model);
      row[submittedAtName] = toDatasetColumnValue(surveyResponse.updatedAt);
      if (respondents) row[respondentName] = respondents.respondentIds.get(surveyResponse.participantToken) ?? null;
      return row;
    }),
    // A respondent past a program read's cap is absent from the column, and every row still carries it as null
    ...(respondents?.isPartial && { partialColumns: [respondentName] }),
    totalRows,
  };
};
