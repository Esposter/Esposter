import type { KeywordDefinition } from "ajv";

export const uniqueColumnNameKeywordDefinition = {
  keyword: "uniqueColumnName",
  schemaType: "boolean",
  type: "string",
} as const satisfies KeywordDefinition;
