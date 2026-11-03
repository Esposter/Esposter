import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";
import type { SurveyDocument, SurveyQuestionNode } from "survey-engine";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import {
  checkIsSurveyAnsweringNode,
  flattenSurveyQuestions,
  SurveyExpressionDisplayFormat,
  SurveyNodeType,
  SurveyTextInputType,
} from "survey-engine";

const DATE_INPUT_TYPES: ReadonlySet<SurveyTextInputType> = new Set([
  SurveyTextInputType.Date,
  SurveyTextInputType.DatetimeLocal,
]);

const getColumnType = (question: SurveyQuestionNode): DatasetColumnType => {
  switch (question.type) {
    case SurveyNodeType.Boolean:
      return ColumnType.Boolean;
    case SurveyNodeType.Expression:
      return question.props.displayFormat === SurveyExpressionDisplayFormat.None
        ? ColumnType.String
        : ColumnType.Number;
    case SurveyNodeType.Rating:
    case SurveyNodeType.Slider:
      return ColumnType.Number;
    case SurveyNodeType.Text:
      if (question.props.inputType === SurveyTextInputType.Number) return ColumnType.Number;
      else if (DATE_INPUT_TYPES.has(question.props.inputType)) return ColumnType.Date;
      else return ColumnType.String;
    default:
      return ColumnType.String;
  }
};

// A dynamic panel is one question, so its one column is the answer of the whole panel rather than one per template question
export const getSurveyDocumentDatasetColumns = (document: SurveyDocument): DatasetColumn[] =>
  flattenSurveyQuestions(document.content)
    .filter((question) => checkIsSurveyAnsweringNode(question))
    .map((question) => {
      const { name, title } = question.props;
      return { name, type: getColumnType(question), ...(title && { title }) };
    });
