import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";
import type { DatasetColumnType } from "#shared/models/dataset/DatasetColumnType";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";

interface SurveyModelElement {
  elements?: SurveyModelElement[];
  inputType?: string;
  name?: string;
  type?: string;
}

const PresentationElementTypes: ReadonlySet<string> = new Set(["html", "image"]);

const DateInputTypes: ReadonlySet<string> = new Set(["date", "datetime-local"]);

const getColumnType = ({ inputType, type }: SurveyModelElement): DatasetColumnType => {
  switch (type) {
    case "boolean":
      return ColumnType.Boolean;
    case "rating":
      return ColumnType.Number;
    case "text":
      if (inputType === "number") return ColumnType.Number;
      else if (inputType && DateInputTypes.has(inputType)) return ColumnType.Date;
      else return ColumnType.String;
    default:
      return ColumnType.String;
  }
};

const flattenElements = (elements: SurveyModelElement[]): SurveyModelElement[] =>
  elements.flatMap((element) => (element.elements ? flattenElements(element.elements) : element));

export const getSurveyModelDatasetColumns = (surveyModel: Record<string, unknown>): DatasetColumn[] => {
  if (!Array.isArray(surveyModel.pages)) return [];

  const columns: DatasetColumn[] = [];
  for (const element of flattenElements(surveyModel.pages)) {
    const { name, type } = element;
    if (!name || !type || PresentationElementTypes.has(type)) continue;
    columns.push({ name, type: getColumnType(element) });
  }
  return columns;
};
