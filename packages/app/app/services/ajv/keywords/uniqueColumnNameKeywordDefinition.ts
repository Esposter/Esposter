import type { KeywordDefinition } from "ajv";

interface ColumnNameValidationState {
  columnNames: string[];
  currentName: string;
}

const columnNameValidationState: ColumnNameValidationState = { columnNames: [], currentName: "" };

export const setColumnNameValidationState = (state: ColumnNameValidationState) => {
  columnNameValidationState.columnNames = state.columnNames;
  columnNameValidationState.currentName = state.currentName;
};

export const uniqueColumnNameKeywordDefinition = {
  keyword: "uniqueColumnName",
  schemaType: "boolean",
  type: "string",
  validate(_schema: boolean, data: string) {
    const { columnNames, currentName } = columnNameValidationState;
    return data === currentName || !columnNames.includes(data);
  },
} as const satisfies KeywordDefinition;
