import type { KeywordDefinition } from "ajv";

interface ColumnNameValidationState {
  columnNames: string[];
  currentName: string;
}

let getColumnNameValidationState: () => ColumnNameValidationState = () => ({ columnNames: [], currentName: "" });

export const setColumnNameValidationStateGetter = (getter: () => ColumnNameValidationState) => {
  getColumnNameValidationState = getter;
};

export const uniqueColumnName: KeywordDefinition = {
  keyword: "uniqueColumnName",
  schemaType: "boolean",
  type: "string",
  validate(_schema: boolean, data: string) {
    const { columnNames, currentName } = getColumnNameValidationState();
    return data === currentName || !columnNames.includes(data);
  },
};
