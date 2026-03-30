import type { KeywordDefinition, SchemaValidateFunction } from "ajv";

interface ColumnNameValidationState {
  columnNames: string[];
  currentName: string;
}

let getColumnNameValidationState: () => ColumnNameValidationState = () => ({ columnNames: [], currentName: "" });

export const setColumnNameValidationStateGetter = (getter: () => ColumnNameValidationState) => {
  getColumnNameValidationState = getter;
};

const validate: SchemaValidateFunction = function validate(_schema: boolean, data: string) {
  const { columnNames, currentName } = getColumnNameValidationState();
  return data === currentName || !columnNames.includes(data);
};
validate.errors = [{ keyword: "uniqueColumnName", message: "Column already exists" }];

export const uniqueColumnName: KeywordDefinition = {
  keyword: "uniqueColumnName",
  schemaType: "boolean",
  type: "string",
  validate,
};
